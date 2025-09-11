import * as THREE from 'three';
//import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { TextGeometry } from 'three/examples/jsm/Addons.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/Addons.js';
import { FontLoader } from 'three/examples/jsm/Addons.js';
import { XelisNode } from '../../app/xelis_node';
import { Block, RPCMethod as DaemonRPCMethod, HeightRangeParams } from '@xelis/sdk/daemon/types';
import { block_type_colors } from '../block_type_box/block_type_box';
import CameraControls from 'camera-controls';
import { RPCRequest } from '@xelis/sdk/rpc/types';
import { OverlayLoading } from '../overlay_loading/overlay_loading';
import { DAGBlockDetails } from './block_details/block_details';
import { clamp_number } from '../../utils/clamp_number';

CameraControls.install({ THREE });

export class DAG {
    element: HTMLDivElement;

    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    orthographic_camera: THREE.OrthographicCamera;
    controls: CameraControls;
    clock: THREE.Clock;
    block_group: THREE.Group;
    raycaster: THREE.Raycaster;
    pointer: THREE.Vector2;

    overlay_loading: OverlayLoading;
    block_details: DAGBlockDetails;
    hovered_block_mesh?: THREE.Mesh;

    constructor() {
        this.element = document.createElement(`div`);

        this.block_details = new DAGBlockDetails();
        this.element.appendChild(this.block_details.element);

        this.overlay_loading = new OverlayLoading();
        this.element.appendChild(this.overlay_loading.element);

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

        const grid = new THREE.GridHelper(1000, 500, new THREE.Color("#202020"), new THREE.Color("#202020"));
        grid.rotation.x = -Math.PI / 2;
        this.scene.add(grid);
        this.block_group = new THREE.Group();
        this.scene.add(this.block_group);

        const middle_line = this.create_middle_line();
        this.scene.add(middle_line);

        window.addEventListener('resize', this.on_resize);

        this.element.addEventListener(`pointermove`, this.on_pointer_move);
        this.element.addEventListener(`mousedown`, this.on_click);
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

        if (this.hovered_block_mesh) {
            const block = this.hovered_block_mesh.userData.block as Block;
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

    async load(height: number) {
        height = 434191;
        const node = XelisNode.instance();

        const requests = [] as RPCRequest[];
        requests.push({
            method: DaemonRPCMethod.GetBlocksRangeByHeight,
            params: {
                start_height: height - 30,
                end_height: height - 11
            } as HeightRangeParams
        });
        requests.push({
            method: DaemonRPCMethod.GetBlocksRangeByHeight,
            params: {
                start_height: height - 10,
                end_height: height + 9
            } as HeightRangeParams
        });
        requests.push({
            method: DaemonRPCMethod.GetBlocksRangeByHeight,
            params: {
                start_height: height + 10,
                end_height: height + 29
            } as HeightRangeParams
        });

        const res = await node.rpc.batchRequest(requests);

        let blocks = [] as Block[];
        res.forEach((result) => {
            if (result instanceof Error) {
                throw result;
            } else {
                blocks = [...blocks, ...result as Block[]];
            }
        });

        /*const blocks = await node.rpc.getBlocksRangeByHeight({
            start_height: height - 10,
            end_height: height + 10
        });*/
        const group_blocks = new Map<number, Block[]>();
        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            const heigh_blocks = group_blocks.get(block.height);
            if (heigh_blocks) {
                group_blocks.set(block.height, [...heigh_blocks, block]);
            } else {
                group_blocks.set(block.height, [block]);
            }
        }

        group_blocks.forEach((height_blocks, x) => {
            height_blocks.forEach((block, y) => {
                const box_mesh = this.create_box_mesh(block);
                const center_y = (y * 5) - (height_blocks.length / 2 * 5);
                box_mesh.position.set(x * 4, center_y, 0);
                this.block_group.add(box_mesh);
            });
        });

        new THREE.Box3().setFromObject(this.block_group).getCenter(this.block_group.position).multiplyScalar(-1);
    }

    intercept_block() {
        const mesh_blocks = this.block_group.getObjectsByProperty(`name`, `block`) as THREE.Mesh[];
        const intersects = this.raycaster.intersectObjects<THREE.Mesh>(mesh_blocks);
        if (intersects.length > 0) {
            if (!this.hovered_block_mesh) {
                const intersection = intersects[0];
                const block_mesh = intersection.object;
                block_mesh.scale.set(0.95, 0.95, 0.95);
                this.hovered_block_mesh = block_mesh;
            }
        } else {
            this.hovered_block_mesh?.scale.set(1, 1, 1);
            this.hovered_block_mesh = undefined;
        }
    }

    create_middle_line() {
        const mat = new THREE.LineBasicMaterial({ color: new THREE.Color(`#404040`) });

        const points = [
            new THREE.Vector3(0, -1000, 0),
            new THREE.Vector3(0, 1000, 0)
        ];

        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geo, mat);
        return line;
    }

    create_box_mesh(block: Block) {
        const size = 2.5;
        const group = new THREE.Group();
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
        box.userData = { block };
        box.name = "block";
        group.add(box);

        const loader = new FontLoader();
        loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
            // hash
            {
                const geo = new TextGeometry(block.hash.substring(block.hash.length - 6), {
                    font: font,
                    size: 0.5,
                    depth: 0.5
                });
                const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) });
                const text_mesh = new THREE.Mesh(geo, mat);
                geo.computeBoundingBox();
                if (geo.boundingBox) {
                    text_mesh.position.set(geo.boundingBox.max.x / -2, 1.5, -0.25);
                }

                group.add(text_mesh);
            }

            // height
            {
                const geo = new TextGeometry(block.height.toLocaleString(), {
                    font: font,
                    size: 0.5,
                    depth: 0.5
                });

                const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) });
                const text_mesh = new THREE.Mesh(geo, mat);
                geo.computeBoundingBox();
                if (geo.boundingBox) {
                    text_mesh.position.set(geo.boundingBox.max.x / -2, -2, -0.25);
                }

                group.add(text_mesh);
            }

            // block type
            {
                const first_letter = block.block_type.substring(0, 1).toUpperCase();
                const geo = new TextGeometry(first_letter, {
                    font: font,
                    size: 1,
                    depth: 0.5
                });

                const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(`black`) });
                const text_mesh = new THREE.Mesh(geo, mat);
                geo.computeBoundingBox();
                if (geo.boundingBox) {
                    text_mesh.position.set(geo.boundingBox.max.x / -2, geo.boundingBox.max.y / -2, -0.25);
                }

                group.add(text_mesh);
            }
        });

        return group;
    }

    render = (time: number) => {
        this.raycaster.setFromCamera(this.pointer, this.orthographic_camera);
        this.intercept_block();

        //this.uniforms.time.value = this.clock.getElapsedTime();
        const cam_pos = this.orthographic_camera.position;
        /*if (cam_pos.x < -100) {
            this.controls.normalizeRotations().reset();
            this.block_group.clear();
            this.load(80)
        }

        if (cam_pos.x > 100) {
            //const delta = new THREE.Vector3(0, 0, 0); // change direction as needed
            this.controls.normalizeRotations().reset();
            this.block_group.clear();
            this.load(120)
            // this.orthographic_camera.position.set(0, 0,0);
            // this.orthographic_camera.lookAt(0, 0, 0);
            //  this.controls.target.set(0, 0, 0);
            //this.controls.update();
        }*/

        const delta = this.clock.getDelta();
        this.controls.update(delta);
        this.renderer.render(this.scene, this.orthographic_camera);
    }
}