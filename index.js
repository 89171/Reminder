const {menubar} = require("menubar")

const mb = menubar({
    icon: "icon.png"
})

mb.on("ready", () => {
    console.log("app is ready")
    // your app code here
})
