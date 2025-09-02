import * as THREE from 'three';
//import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { TextGeometry } from 'three/examples/jsm/Addons.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/Addons.js';
import { FontLoader } from 'three/examples/jsm/Addons.js';
import { XelisNode } from '../../app/xelis_node';
import { Block, RPCMethod as DaemonRPCMethod, HeightRangeParams } from '@xelis/sdk/daemon/types';
import { block_type_colors } from '../block_type_box/block_type_box';
import { fetch_blocks } from '../../fetch_helpers/fetch_blocks';
import CameraControls from 'camera-controls';
import { RPCRequest } from '@xelis/sdk/rpc/types';

CameraControls.install({ THREE });

export class DAG {
    element: HTMLDivElement;

    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    orthographic_camera: THREE.OrthographicCamera;
    controls: CameraControls;
    clock: THREE.Clock;
    block_group: THREE.Group;

    constructor() {
        this.element = document.createElement(`div`);

        this.clock = new THREE.Clock();
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color('#151515');
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);

        const rect = this.element.getBoundingClientRect();
        this.renderer.setSize(rect.width, rect.height);

        this.renderer.setAnimationLoop(this.render);
        this.element.appendChild(this.renderer.domElement);

        this.orthographic_camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 2000);

        this.orthographic_camera.zoom = 15;
        this.orthographic_camera.position.set(0, 0, 1);


        this.controls = new CameraControls(this.orthographic_camera, this.renderer.domElement);
        this.controls.truckSpeed = 1;

        //this.controls.mouseButtons

        //this.controls.enableRotate = false;
        //this.controls.screenSpacePanning = true;
        //this.controls.enableZoom = true;
        this.controls.mouseButtons.left = CameraControls.ACTION.TRUCK;
        this.controls.mouseButtons.middle = CameraControls.ACTION.ZOOM;

        //this.controls.update();

        const grid = new THREE.GridHelper(1000, 500, new THREE.Color("#202020"), new THREE.Color("#202020"));
        grid.rotation.x = -Math.PI / 2;
        this.scene.add(grid);
        this.block_group = new THREE.Group();
        this.scene.add(this.block_group);

        window.addEventListener('resize', this.on_resize);
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

    async load(height: number) {
        const node = XelisNode.instance();

        const requests = [] as RPCRequest[];
        requests.push({
            method: DaemonRPCMethod.GetBlocksRangeByHeight,
            params: {
                start_height: height - 30,
                end_height: height - 10
            } as HeightRangeParams
        });
        requests.push({
            method: DaemonRPCMethod.GetBlocksRangeByHeight,
            params: {
                start_height: height - 10,
                end_height: height + 10
            } as HeightRangeParams
        });
        requests.push({
            method: DaemonRPCMethod.GetBlocksRangeByHeight,
            params: {
                start_height: height + 10,
                end_height: height + 30
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

        blocks.forEach((block, i) => {
            //const x = block.topoheight! - topoheight;
            const box_mesh = this.create_box_mesh(block);
            box_mesh.position.set(i * 4, 0, 0);
            this.block_group.add(box_mesh);
        });

        new THREE.Box3().setFromObject(this.block_group).getCenter(this.block_group.position).multiplyScalar(-1);
    }

    set_active() {

    }

    create_box_mesh(block: Block) {
        const size = 2.5;
        const group = new THREE.Group();
        const color = block_type_colors[block.block_type];

        const geo = new RoundedBoxGeometry(size, size, 0.5, 10, 0.5);
        const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) });
        const box = new THREE.Mesh(geo, mat);
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
        });

        return group;
    }

    render = (time: number) => {
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