import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { TextGeometry } from 'three/examples/jsm/Addons.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/Addons.js';
import { FontLoader } from 'three/examples/jsm/Addons.js';
import { XelisNode } from '../../app/xelis_node';
import { Block } from '@xelis/sdk/daemon/types';
import { block_type_colors } from '../block_type_box/block_type_box';

export class DAG {
    element: HTMLDivElement;

    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    orthographic_camera: THREE.OrthographicCamera;
    controls: OrbitControls;

    constructor() {
        this.element = document.createElement(`div`);

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color('#151515');
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);

        const rect = this.element.getBoundingClientRect();
        this.renderer.setSize(rect.width, rect.height);

        this.renderer.setAnimationLoop(this.render);
        this.element.appendChild(this.renderer.domElement);

        const aspect = rect.width / rect.height;
        //this.perspective_camera = new THREE.PerspectiveCamera(70, aspect, 0.1, 1000);
        //this.perspective_camera.position.set(0, 0, 50);

        this.orthographic_camera = new THREE.OrthographicCamera();

        this.orthographic_camera.zoom = 10;
        this.orthographic_camera.position.set(0, 0, 2);
        this.orthographic_camera.updateProjectionMatrix();

        this.controls = new OrbitControls(this.orthographic_camera, this.renderer.domElement);
        //this.controls.enableRotate = false;
        this.controls.screenSpacePanning = true;
        this.controls.enableZoom = true;
        this.controls.mouseButtons = {
            //LEFT: THREE.MOUSE.PAN,
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN
        };
        this.controls.update();

        const grid = new THREE.GridHelper(1000, 500, new THREE.Color("#202020"), new THREE.Color("#202020"));
        grid.rotation.x = -Math.PI / 2;
        this.scene.add(grid);

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

    async load(topoheight: number) {
        const node = XelisNode.instance();
        const blocks = await node.rpc.getBlocksRangeByTopoheight({
            start_topoheight: topoheight - 10,
            end_topoheight: topoheight + 10
        });

        blocks.forEach((block, i) => {
            const x = block.topoheight! - topoheight;
            const box_mesh = this.create_box_mesh(block);
            box_mesh.position.set(
                x * 4,
                0,
                0
            );
            this.scene.add(box_mesh);
        });
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
        this.controls.update();
        this.renderer.render(this.scene, this.orthographic_camera);
    }
}