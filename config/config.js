'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
    // Init module configuration options
    var applicationModuleName = 'fadeit';
    var applicationModuleVendorDependencies = ['ngResource', 'ngCookies', 'ngAnimate', 'ui.router', 'ui.bootstrap', 'ui.utils', 'angularMoment', 'linkify', 'angularLoad', 'pascalprecht.translate'];

    // Add a new vertical module
    var registerModule = function(moduleName) {
        // Create angular module
        angular.module(moduleName, []);

        // Add the module to the AngularJS configuration file
        angular.module(applicationModuleName).requires.push(moduleName);
    };

    return {
        applicationModuleName: applicationModuleName,
        applicationModuleVendorDependencies: applicationModuleVendorDependencies,
        registerModule: registerModule
    };
})();

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
                                                                      function($locationProvider) {
                                                                          $locationProvider.hashPrefix('!');
                                                                          //$locationProvider.html5Mode(true); //removes '#!' from the path
                                                                      }
]);

angular.module(ApplicationConfiguration.applicationModuleName).controller('AppCtrl', ['$scope', '$location', 'StyleService', '$log', function AppCtrl ( $scope, $location, StyleService, $log ) {

    //load services
    $scope.styles = StyleService.getStyles();

    //css class containers & vars
    $scope.cssClasses = $scope.styles.cssClasses;
    $scope.projectOffset = $scope.styles.projectOffset;
    $scope.newsSectionHeight = $scope.styles.newsSectionHeight;

    //wow animation variables
    $scope.wow = '';

    //variables used globally
    $scope.pageTitle = '';
    $scope.pageImage = '';
    $scope.currentDate = new Date();

    /*
     * Unsets wow and re-starts it to refresh animations
     * Used by the reloadWow directive
     *
     */
    $scope.initWow = function initWow(){
        $scope.wow = '';

        $scope.wow = new WOW({
            live: false,
            mobile: false
        });

        $scope.wow.init();
    };

    /*
     * To simulate a 'classic' page setup (you go to the top on the new page)
     * we scroll at every $stateChangeSuccess to top or news.
     *
     * If the news' CSS property 'display' is NOT 'none'
     * we scroll past the news section (+ an offset).
     *
     * Method also used while listening to $on('newsReady')
     * which helps determine the right 'display' (won't be ready at first $stateChange)
     *
     */
    $scope.scrollToNewsOrTop = function scrollToNewsOrTop(){
        var scrollPosition = 0;
        var scrollDelay = 0;

        if($scope.hideNews && typeof angular.element('#news').css('display') !== 'undefined' && angular.element('#news').css('display') !== 'none'){
            scrollPosition = $scope.newsSectionHeight + $scope.projectOffset;
            scrollDelay = 500;
        }

        angular.element('body, html').delay(scrollDelay).animate({
            scrollTop: scrollPosition
        }, {
            duration: 100
        });
    }

    /*
     * Event callback that wait for a state to change
     * Scrolls the page just after the news section to create the 'illusion'
     * that news is hidden at the top of the page
     *
     * It's very important to set
     * scope.pageImage, scope.pageTitle to ''
     * This way we'll make sure the directive 'leftSidebarMenu'
     * will be notified of a change.
     *
     */
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
        $scope.pageImage = '';
        $scope.pageTitle = '';

        /*
         * updates the <title> tag
         * pageTitle/pageImage is displayed in
         * 'modules/core/views/left-sidebar-menu.html'
         *
         * htmlTitle is always set.
         * There can be either a pageTitle or pageImage set, not both
         *
         */
        if(angular.isDefined(toState.data.pageTitle)){
            $scope.htmlTitle = toState.data.pageTitle + ' - fadeit, software development agency';

            if(angular.isDefined(toState.data.imageUrl)){
                $scope.pageImage = toState.data.imageUrl;
            }
            else{
                $scope.pageTitle = toState.data.pageTitle;
            }
        }

        /*
         * Don't display news on the pages that have hideNews: true
         */
        $scope.hideNews = true;
        if(angular.isDefined(toState.data.hideNews)){
            if(toState.data.hideNews){
                $scope.hideNews = false;
            }
        }

        //Simulates a 'real' page
        $scope.scrollToNewsOrTop();
    });

    /*
     * Listens to controllers that want to emit their titles
     * Used for custom titles (not from state provider).
     * With this we can set the titles of 'wildcard' paths
     * (url: '/project/:projectId')
     *
     */
    $scope.$on('changedPage', function changedPage(event, pageTitle){
        $scope.pageTitle = pageTitle;
        $scope.htmlTitle = pageTitle + ' fadeit - software development agency';
    });

    /*
     * Listens to the news controller
     * Used in order to scroll to the right position.
     *
     */
    $scope.$on('newsReady', function newsReadyScroll(){
        //Simulates a 'real' page
        $scope.scrollToNewsOrTop();
    });

    /*
     * Hackers gotta hack
     */
    $log.debug('
               ███████╗ █████╗ ██████╗ ███████╗██╗████████╗
               ██╔════╝██╔══██╗██╔══██╗██╔════╝██║╚══██╔══╝
               █████╗  ███████║██║  ██║█████╗  ██║   ██║
               ██╔══╝  ██╔══██║██║  ██║██╔══╝  ██║   ██║
               ██║     ██║  ██║██████╔╝███████╗██║   ██║
               ╚═╝     ╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝   ╚═╝
               \n\n
               Like inspecting code? Check out fadeit.dk/apply
               ');
}]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
    //Fixing facebook bug with redirect
    if (window.location.hash === '#_=_') window.location.hash = '#!';

    //Then init the app
    angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
