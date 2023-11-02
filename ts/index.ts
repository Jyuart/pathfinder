// consts
const MAP_WIDTH = 25;
const MAP_HEIGHT = 15;
const START = { x: 2, y: 2 };
const GOAL = { x: 22, y: 12 };
const SPEED = 100;

const DIR = [
	[ 0, 1 ],
	[ 1, 0 ],
	[ 0, -1 ],
	[ -1, 0]
]

// types
type cell = {
	x: number,
	y: number;
	wall?: boolean;
};

// global state
const map: cell[][] = [];
const path: cell[] = [];

// functions
function init() {
	for (let i = 0; i < MAP_HEIGHT; i++) {
		map[i] = [];
		for (let j = 0; j < MAP_WIDTH; j++) {
			map[i][j] = { x: j, y: i, wall: false };
		}
	}
}

function init_default_walls() {
	// the top row
	map[0].forEach(element => {
		element.wall = true;
	});
	// the bottom row
	map[map.length - 1].forEach(element => {
		element.wall = true;
	});
	map.forEach(element => {
		element[0].wall = true;
		element[element.length - 1].wall = true;
	});
}

function draw_map() {
	// should be only one main element
	let main = document.querySelector('main')!;
	main.style.gridTemplateColumns = `repeat(${MAP_WIDTH}, auto`;

	for (let i = 0; i < map.length; i++) {
		for (let j = 0; j < map[i].length; j++) {
			let el = document.createElement('div');
			el.dataset.x = j.toString();
			el.dataset.y = i.toString();
			el.classList.add('cell');
			if (map[i][j].wall) {
				el.classList.add('wall');
			}
			if (i === START.y && j === START.x) {
				el.classList.add('start');
			}
			if (i === GOAL.y && j === GOAL.x) {
				el.classList.add('goal');
			}
			main.appendChild(el);
		}
	}
}

let hovered_element: HTMLElement;
function add_drawing() {
	document.addEventListener('mousemove', (event) => {
		// do nothing if the LMB isn't clicked
		if (event.buttons !== 1) {
			return;
		}

		// do nothing if the target didn't change
		if (hovered_element === event.target) {
			return;
		}

		hovered_element = event.target as HTMLElement;
		const el_x = Number(hovered_element.dataset.x);
		const el_y = Number(hovered_element.dataset.y);

		// do not turn start and goal into walls
		if ((el_x === GOAL.x && el_y === GOAL.y) ||
			(el_x === START.x && el_y === START.y)) {
			return;
		}

		hovered_element.classList.add('wall');
		map[el_y][el_x].wall = true;
	});
}

function walk(step: cell, seen: boolean[][]) {
	if (map[step.y][step.x].wall) {
		return false;
	}

	if (step.x < 0 ||
		step.x >= MAP_WIDTH ||
		step.y < 0 ||
		step.y >= MAP_HEIGHT) {
		return false;
	}

	if (seen[step.y][step.x]) {
		return false;
	}

	if (step.x === GOAL.x && step.y === GOAL.y) {
		path.push(step);
		return true;
	}

	seen[step.y][step.x] = true;
	path.push(step);

	for (let i = 0; i < DIR.length; i++) {
		const [x, y] = DIR[i];
		if (walk({ x: step.x + x, y: step.y + y }, seen)) {
			return true;
		}
	}

	path.pop();
	return false;
}

function find_path() {
	const seen: boolean[][] = [];

    for (let i = 0; i < map.length; i++) {
        seen.push(new Array(map[0].length).fill(false));
    }

	walk(START, seen);
}

function draw_path() {
	const divs: HTMLElement[] = [];
	path.forEach(element => {
		const el = document.querySelector(`[data-x="${element.x}"][data-y="${element.y}"]`) as HTMLElement;
		divs.push(el);
	});

	for (let i = 0; i < divs.length; i++) {
		setTimeout((_: any) => {
			divs[i].classList.add('step');
		}, i * SPEED);
	}
}

let path_drawn = false;
function add_control_elements() {
	document.addEventListener('keyup', event => {
		if (event.code === 'Space') {
			if (path.length === 0)  {
				find_path();
				console.log(path);
				return;
			} 
			if (!path_drawn) {
				draw_path();
				path_drawn = true;
			}
		}
	})
}

// execution
init();
init_default_walls();
draw_map();
add_drawing();
add_control_elements();
