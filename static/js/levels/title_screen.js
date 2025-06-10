function title_screen() {
	contents = []
	GUIs = []

	args = {}
	let layer1 = new GUILayer(args)
	GUIs.push(layer1)

	args = {
		parent: layer1,
		y: 128,
		w: 256,
		h: 64,
		border_color: 'rgba(104, 128, 143, 1.0)',
		align: CENTER,
		releaseFunc: () => {
			lvl1.enter()
		}
	}
	let play_btn = new Button(args)

	args = {
		parent: play_btn,
		align: CENTER,
		text: 'Play',
		font: 'Oswald',
		font_size: 40
	}
	let play_btn_txt = new TextBox(args)
}

