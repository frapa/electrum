$(function () {
    // Starts program
    Electrum.mainView = new App_View_Main();
    RootView.openMain(Electrum.mainView);
    
	var logInScreen = new Kernel_View_LogIn();
	RootView.open(logInScreen, 'login-screen')
});
