import * as THREE from 'three';
import { Font, TextGeometry } from 'three/examples/jsm/Addons.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/Addons.js';
import { XelisNode } from '../../app/xelis_node';
import { Block, RPCMethod as DaemonRPCMethod, HeightRangeParams, RPCEvent as DaemonRPCEvent, BlockOrdered, BlockType } from '@xelis/sdk/daemon/types';
import { block_type_colors } from '../block_type_box/block_type_box';
import CameraControls from 'camera-controls';
import { RPCRequest } from '@xelis/sdk/rpc/types';
import { OverlayLoading } from '../overlay_loading/overlay_loading';
import { DAGBlockDetails } from './block_details/block_details';
import { clamp_number } from '../../utils/clamp_number';
import { HeightControl } from './height_control/height_control';
import helvetiker_regular_font_data from './helvetiker_regular.typeface.json';

const three_lib_for_camera = {
    Vector2: THREE.Vector2,
    Vector3: THREE.Vector3,
    Vector4: THREE.Vector4,
    Quaternion: THREE.Quaternion,
    Matrix4: THREE.Matrix4,
    Spherical: THREE.Spherical,
    Box3: THREE.Box3,
    Sphere: THREE.Sphere,
    Raycaster: THREE.Raycaster,
};

CameraControls.install({ THREE: three_lib_for_camera });

export class DAG {
    element: HTMLDivElement;

    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    orthographic_camera: THREE.OrthographicCamera;
    controls: CameraControls;
    clock: THREE.Clock;
    raycaster: THREE.Raycaster;
    pointer: THREE.Vector2;

    block_group: THREE.Group;
    tip_line_group: THREE.Group;

    overlay_loading: OverlayLoading;
    block_details: DAGBlockDetails;
    height_control: HeightControl;
    hovered_block_box_mesh?: THREE.Mesh;

    block_mesh_hashes: Map<string, THREE.Group>;
    blocks_by_height: Map<number, Block[]>;

    helvetiker_regular_font: Font;
    is_live: boolean;
    target_line: THREE.Line;

    constructor() {
        this.element = document.createElement(`div`);

        this.block_mesh_hashes = new Map();
        this.blocks_by_height = new Map();
        this.helvetiker_regular_font = new Font(helvetiker_regular_font_data);

        this.block_details = new DAGBlockDetails();
        this.element.appendChild(this.block_details.element);

        this.overlay_loading = new OverlayLoading();
        this.element.appendChild(this.overlay_loading.element);

        this.height_control = new HeightControl();
        this.height_control.add_listener(`new_height`, (height) => {
            if (height !== undefined) {
                this.load_blocks(height);
                this.set_live(false);
            }
        });

        this.is_live = false;
        this.height_control.live_btn_element.addEventListener(`click`, () => {
            this.set_live(!this.is_live);
        });

        this.element.appendChild(this.height_control.element);

        this.clock = new THREE.Clock();
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color('#151515');
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();

        const rect = this.element.getBoundingClientRect();
        this.renderer.setSize(rect.width, rect.height);

        this.renderer.setAnimationLoop(this.render);
        this.element.appendChild(this.renderer.domElement);

        this.orthographic_camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 2000);

        this.orthographic_camera.zoom = 15;
        this.orthographic_camera.position.set(0, 0, 1);

        this.controls = new CameraControls(this.orthographic_camera, this.renderer.domElement);
        this.controls.truckSpeed = 1;
        this.controls.maxZoom = 20;
        this.controls.minZoom = 5;
        this.controls.mouseButtons.left = CameraControls.ACTION.TRUCK;
        this.controls.mouseButtons.middle = CameraControls.ACTION.ZOOM;

        this.controls.addEventListener(`controlstart`, () => {
            this.block_details.hide();
        });

        const grid = new THREE.GridHelper(1000, 500, new THREE.Color("#202020"), new THREE.Color("#202020"));
        grid.rotation.x = -Math.PI / 2;
        this.scene.add(grid);

        this.tip_line_group = new THREE.Group();
        this.scene.add(this.tip_line_group);

        this.block_group = new THREE.Group();
        this.scene.add(this.block_group);

        this.target_line = this.create_target_line();
        this.scene.add(this.target_line);

        window.addEventListener('resize', this.on_resize);

        this.element.addEventListener(`pointermove`, this.on_pointer_move);
        this.element.addEventListener(`click`, this.on_click);
    }

    on_new_block = async (new_block?: Block, err?: Error) => {
        console.log("new_block", new_block);

        if (new_block) {
            this.add_block_to_height(new_block);

            if (this.blocks_by_height.size >= 25) {
                const min_height = Math.min(...this.blocks_by_height.keys());
                this.delete_blocks_at_height(min_height);
            }

            const block_mesh = this.create_block_mesh(new_block);
            const blocks_at_height = this.blocks_by_height.get(new_block.height);
            if (blocks_at_height) {
                const block_count = blocks_at_height.length - 1;
                const center_y = block_count * 5; //(block_count * 5) - (block_count / 2 * 5);
                block_mesh.position.set((this.blocks_by_height.size - 1) * 4, center_y, 0);
            }

            this.block_group.add(block_mesh);

            const new_height = new_block.height;
            this.height_control.set_height(new_height);
            this.height_control.set_max_height(new_height)
            this.move_to_block(new_height);

            new_block.tips.forEach((hash) => {
                const block_mesh_target = this.block_mesh_hashes.get(hash);
                if (block_mesh_target) {
                    const tip_hash = this.create_tip_hash(new_block.hash, hash);
                    const line_mesh = this.create_tip_line_mesh(block_mesh, block_mesh_target, tip_hash);
                    this.tip_line_group.add(line_mesh);
                }
            });

            const node = XelisNode.instance();
            const stable_height = await node.ws.methods.getStableHeight();
            this.blocks_by_height.forEach((blocks, height) => {
                if (
                    blocks.length === 1 &&
                    height <= stable_height
                ) {
                    const single_block = blocks[0];
                    if (single_block.block_type === BlockType.Normal) {
                        single_block.block_type = BlockType.Sync;

                        const block_mesh = this.block_group.children.find(b => {
                            return b.userData.block.hash === single_block.hash;
                        });

                        if (block_mesh) {
                            const new_block_mesh = this.create_block_mesh(single_block);
                            new_block_mesh.position.copy(block_mesh.position);
                            this.block_group.remove(block_mesh);
                            this.block_group.add(new_block_mesh);
                        }
                    }
                }
            });
        }
    }

    delete_blocks_at_height(height: number) {
        const blocks_to_delete = this.blocks_by_height.get(height);
        if (blocks_to_delete) {
            blocks_to_delete.forEach((block) => {
                const block_mesh = this.block_mesh_hashes.get(block.hash);
                if (block_mesh) {
                    this.block_group.remove(block_mesh);
                    this.block_mesh_hashes.delete(block.hash);
                }
            });
            this.blocks_by_height.delete(height);

            const tip_lines_to_delete = this.tip_line_group.children.filter((tip_line_mesh) => {
                const block_target_height = tip_line_mesh.userData.block_target_height;
                return block_target_height === height;
            });
            this.tip_line_group.remove(...tip_lines_to_delete);

            this.block_group.children.forEach((block_mesh) => {
                block_mesh.position.sub(new THREE.Vector3(4, 0, 0));
            });

            this.tip_line_group.children.forEach((tip_line_mesh) => {
                tip_line_mesh.position.sub(new THREE.Vector3(4, 0, 0));
            });
        }
    }

    on_block_ordered = async (block_ordered?: BlockOrdered | undefined, err?: Error) => {
        console.log("block_ordered", block_ordered);
        if (block_ordered) {
            const node = XelisNode.instance();
            const block = await node.ws.methods.getBlockByHash({
                hash: block_ordered.block_hash
            });

            const block_mesh = this.block_mesh_hashes.get(block_ordered.block_hash);
            if (block_mesh) {
                const new_block_mesh = this.create_block_mesh(block);
                new_block_mesh.position.copy(block_mesh.position);
                this.block_group.remove(block_mesh);
                this.block_group.add(new_block_mesh);
            }
        }
    }

    async set_live(live: boolean) {
        this.is_live = live;
        const node = XelisNode.instance();

        if (live) {
            const current_height = await node.rpc.getHeight();
            this.load_blocks(current_height);

            node.ws.methods.listen(DaemonRPCEvent.NewBlock, this.on_new_block);
            node.ws.methods.listen(DaemonRPCEvent.BlockOrdered, this.on_block_ordered);
            this.height_control.live_btn_element.classList.add(`active`);
        }
        else {
            node.ws.methods.closeListener(DaemonRPCEvent.NewBlock, this.on_new_block);
            node.ws.methods.closeListener(DaemonRPCEvent.BlockOrdered, this.on_block_ordered);
            this.height_control.live_btn_element.classList.remove(`active`);
        }
    }

    clear_node_events() {
        const node = XelisNode.instance();
        node.ws.methods.closeListener(DaemonRPCEvent.NewBlock, this.on_new_block);
        node.ws.methods.closeListener(DaemonRPCEvent.BlockOrdered, this.on_block_ordered);
    }

    update_size() {
        const rect = this.element.getBoundingClientRect();

        this.orthographic_camera.left = rect.width / -2;
        this.orthographic_camera.right = rect.width / 2;
        this.orthographic_camera.top = rect.height / 2;
        this.orthographic_camera.bottom = rect.height / -2;
        this.orthographic_camera.updateProjectionMatrix();
        this.renderer.setSize(rect.width, rect.height);
    }

    on_resize = () => {
        this.update_size();
    }

    on_pointer_move = (e: PointerEvent) => {
        const rect = this.element.getBoundingClientRect();
        const offset_client_x = e.clientX - rect.x;
        const offset_client_y = e.clientY - rect.y;
        const x = (offset_client_x / rect.width) * 2 - 1;
        const y = -(offset_client_y / rect.height) * 2 + 1;
        this.pointer.x = x;
        this.pointer.y = y;
    }

    on_click = (e: MouseEvent) => {
        const rect = this.element.getBoundingClientRect();
        const offset_mouse_x = e.clientX - rect.x;
        const offset_mouse_y = e.clientY - rect.y;

        if (this.hovered_block_box_mesh && this.hovered_block_box_mesh.parent) {
            const block = this.hovered_block_box_mesh.parent.userData.block as Block;
            const block_details_rect = this.block_details.element.getBoundingClientRect();

            let block_details_x = offset_mouse_x + 20;
            let block_details_y = offset_mouse_y - (block_details_rect.height / 2);

            // make sure the block details box does not go off screen
            block_details_x = clamp_number(block_details_x, 0, rect.width - block_details_rect.width - 20);
            block_details_y = clamp_number(block_details_y, 0, rect.height - (block_details_rect.height / 2));

            this.block_details.set(block);
            this.block_details.set_position(block_details_x, block_details_y);
            this.block_details.show();
        } else {
            this.block_details.hide();
        }
    }

    async load_blocks(height: number) {
        // height = 434191; // height with a lot of side blocks
        this.controls.normalizeRotations().reset(true);
        this.tip_line_group.clear();
        this.block_group.clear();
        this.block_mesh_hashes.clear();
        this.blocks_by_height.clear();
        this.target_line.visible = false;

        const node = XelisNode.instance();

        const max_height = await node.rpc.getHeight();
        this.height_control.set_max_height(max_height);
        this.height_control.set_height(height);

        const start_height = Math.max(0, height - 25);
        const end_height = Math.min(max_height, height + 25);
        const requests = [] as RPCRequest[];
        for (let i = start_height; i < end_height; i += 20) {
            let start = i;
            let end = i + 20 - 1;
            if (end > end_height) {
                end = end_height;
            }

            requests.push({
                method: DaemonRPCMethod.GetBlocksRangeByHeight,
                params: {
                    start_height: start,
                    end_height: end
                } as HeightRangeParams
            });
        }

        const res = await node.rpc.batchRequest(requests);

        let blocks = [] as Block[];
        res.forEach((result, i) => {
            if (result instanceof Error) {
                throw result;
            } else {
                blocks = [...blocks, ...result as Block[]];
            }
        });

        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            this.add_block_to_height(block);
        }

        let x = 0;
        this.blocks_by_height.forEach((height_blocks) => {
            height_blocks.forEach((block, y) => {
                const block_mesh = this.create_block_mesh(block);
                const center_y = (y * 5) //- (height_blocks.length / 2 * 5);
                block_mesh.position.set(x * 4, center_y, 0);
                this.block_group.add(block_mesh);
            });

            x++;
        });

        this.block_group.children.forEach((block_mesh) => {
            const block = block_mesh.userData.block as Block;
            block.tips.forEach((hash) => {
                const block_mesh_target = this.block_mesh_hashes.get(hash);
                if (block_mesh_target) {
                    const tip_hash = this.create_tip_hash(block.hash, hash);
                    const line_mesh = this.create_tip_line_mesh(block_mesh as THREE.Group, block_mesh_target, tip_hash);
                    this.tip_line_group.add(line_mesh);
                }
            });
        });

        this.target_line.visible = true;
        this.move_to_block(height);
    }

    move_to_block(height: number) {
        const block_mesh = this.block_group.children.find((b) => {
            return b.userData.block.height === height;
        });

        if (block_mesh) {
            const x = block_mesh.position.x;
            this.target_line.position.set(x, 0, 0);
            this.controls.moveTo(x, 0, 0, true);
        }
    }

    /*
    center_blocks() {
        this.tip_line_group.position.set(0, 0, 0);
        this.block_group.position.set(0, 0, 0);
        // center blocks and block tip lines
        new THREE.Box3().setFromObject(this.block_group).getCenter(this.block_group.position).multiplyScalar(-1);
        new THREE.Box3().setFromObject(this.tip_line_group).getCenter(this.tip_line_group.position).multiplyScalar(-1);
    }
    */

    add_block_to_height(block: Block) {
        const heigh_blocks = this.blocks_by_height.get(block.height);
        if (heigh_blocks) {
            this.blocks_by_height.set(block.height, [...heigh_blocks, block]);
        } else {
            this.blocks_by_height.set(block.height, [block]);
        }
    }

    create_tip_hash(block_hash: string, block_target_hash: string) {
        return `${block_hash}${block_target_hash}`;
    }

    highlight_tip_lines(block: Block) {
        const hashes = block.tips.map(hash => this.create_tip_hash(block.hash, hash));

        this.tip_line_group.children.forEach((tip_line) => {
            const tip_line_mesh = tip_line as THREE.Mesh;
            const tip_line_mat = tip_line_mesh.material as THREE.LineBasicMaterial;
            if (hashes.indexOf(tip_line.userData.hash) !== -1) {
                tip_line_mat.color.set(`white`);
            }
        });
    }

    clear_highlight_tip_lines() {
        this.tip_line_group.children.forEach((tip_line) => {
            const tip_line_mesh = tip_line as THREE.Mesh;
            const tip_line_mat = tip_line_mesh.material as THREE.LineBasicMaterial;
            tip_line_mat.color.set(`#606060`);
        });
    }

    intercept_block() {
        const box_meshes = this.block_group.getObjectsByProperty(`name`, `box_mesh`) as THREE.Mesh[];
        const intersects = this.raycaster.intersectObjects<THREE.Mesh>(box_meshes);
        if (intersects.length > 0) {
            if (!this.hovered_block_box_mesh) {
                const intersection = intersects[0];
                const box_mesh = intersection.object;
                box_mesh.userData.uniforms.enable_outline.value = true;
                // block_mesh.scale.set(0.95, 0.95, 0.95);
                if (box_mesh.parent) {
                    const block = box_mesh.parent.userData.block as Block;
                    this.highlight_tip_lines(block);
                }

                this.hovered_block_box_mesh = box_mesh;
            }
        } else if (this.hovered_block_box_mesh) {
            this.clear_highlight_tip_lines();
            //this.hovered_block_mesh.scale.set(1, 1, 1);
            this.hovered_block_box_mesh.userData.uniforms.enable_outline.value = false;
            this.hovered_block_box_mesh = undefined;
        }
    }

    create_target_line() {
        const mat = new THREE.LineBasicMaterial({ color: new THREE.Color(`#606060`) });

        const points = [
            new THREE.Vector3(0, -1000, 0),
            new THREE.Vector3(0, 1000, 0)
        ];

        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.LineSegments(geo, mat);
        return line;
    }

    create_tip_line_mesh(block_mesh: THREE.Group, block_target_mesh: THREE.Group, hash: string) {
        const mat = new THREE.LineBasicMaterial({ color: new THREE.Color(`#606060`) });

        const points = [
            block_mesh.position,
            block_target_mesh.position
        ];

        const block_target = block_target_mesh.userData.block;

        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geo, mat);
        line.userData.hash = hash;
        line.userData.block_target_height = block_target.height;
        return line;
    }

    create_block_mesh(block: Block) {
        const size = 2.5;
        const block_mesh = new THREE.Group();
        block_mesh.userData.block = block;

        const color = block_type_colors[block.block_type];

        const uniforms = {
            color: { type: 'vec3', value: new THREE.Color(color) },
            outline_color: { type: 'vec3', value: new THREE.Color(`white`) },
            enable_outline: { value: false }
        };

        function vertexShader() {
            return `
                varying vec3 v_uv; 

                void main() {
                    v_uv = position; 
                    vec4 model_view_position = modelViewMatrix * vec4(position, 1.0);
                    gl_Position = projectionMatrix * model_view_position; 
                }
            `;
        }

        function fragmentShader() {
            return `
                uniform vec3 color; 
                uniform vec3 outline_color;
                uniform bool enable_outline;
                varying vec3 v_uv;
         
                void main() {
                    vec2 st = v_uv.xy;
                    vec3 new_color = color;
                    float outline_size = 1.1;

                    if (enable_outline) {
                        if (
                            st.x > outline_size || 
                            st.x < -outline_size ||
                            st.y > outline_size || 
                            st.y < -outline_size
                        ) {
                            new_color = outline_color;
                        }
                    }

                    gl_FragColor = vec4(new_color, 1.0);
                }
            `;
        }

        const geo = new RoundedBoxGeometry(size, size, 0.5, 10, 0.5);
        const mat = new THREE.ShaderMaterial({
            uniforms: uniforms,
            fragmentShader: fragmentShader(),
            vertexShader: vertexShader(),
        });
        const box = new THREE.Mesh(geo, mat);
        box.name = "box_mesh";
        box.userData.uniforms = uniforms;

        block_mesh.add(box);

        // hash
        {
            const geo = new TextGeometry(block.hash.substring(block.hash.length - 6), {
                font: this.helvetiker_regular_font,
                size: 0.5,
                depth: 0.5
            });
            const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) });
            const text_mesh = new THREE.Mesh(geo, mat);
            geo.computeBoundingBox();
            if (geo.boundingBox) {
                text_mesh.position.set(geo.boundingBox.max.x / -2, 1.5, -0.25);
            }

            block_mesh.add(text_mesh);
        }

        // height
        {
            const geo = new TextGeometry(block.height.toLocaleString(), {
                font: this.helvetiker_regular_font,
                size: 0.5,
                depth: 0.5
            });

            const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) });
            const text_mesh = new THREE.Mesh(geo, mat);
            geo.computeBoundingBox();
            if (geo.boundingBox) {
                text_mesh.position.set(geo.boundingBox.max.x / -2, -2, -0.25);
            }

            block_mesh.add(text_mesh);
        }

        // block type
        {
            const first_letter = block.block_type.substring(0, 1).toUpperCase();
            const geo = new TextGeometry(first_letter, {
                font: this.helvetiker_regular_font,
                size: 1,
                depth: 0.5
            });

            const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(`black`) });
            const text_mesh = new THREE.Mesh(geo, mat);
            geo.computeBoundingBox();
            if (geo.boundingBox) {
                text_mesh.position.set(geo.boundingBox.max.x / -2, geo.boundingBox.max.y / -2, -0.25);
            }

            block_mesh.add(text_mesh);
        }

        this.block_mesh_hashes.set(block.hash, block_mesh);
        return block_mesh;
    }

    render = (time: number) => {
        this.raycaster.setFromCamera(this.pointer, this.orthographic_camera);
        this.intercept_block();

        const delta = this.clock.getDelta();
        this.controls.update(delta);
        this.renderer.render(this.scene, this.orthographic_camera);
    }
}