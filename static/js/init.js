$(function () {
    // Starts program
    Electrum.mainView = new App_View_Main();
    RootView.open(Electrum.mainView);
    
	var logInScreen = new App_View_LogIn();
	Electrum.mainView.open(logInScreen, 'login-screen')
});
