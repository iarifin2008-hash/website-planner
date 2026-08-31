tasks.register("assembleDebug") {
    doLast {
        println("Web applet build ready")
    }
}

tasks.register("build") {
    dependsOn("assembleDebug")
}
