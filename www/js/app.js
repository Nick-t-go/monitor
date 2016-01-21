// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.directives', 'firebase', 'ngCordova', 'nvd3','ionic-color-picker' ])

.run(function($ionicPlatform, Auth, $rootScope, $state) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });

  $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
    console.log("stateChangeStart triggered");
    if (toState.authRequired && Auth.getAuth().$getAuth() === null){
      // User isn’t authenticated
      $state.go("app.home");
      event.preventDefault();
    }
    else{
      $rootScope.authData = Auth.getAuth().$getAuth();
      $rootScope.user = Auth.getAuth().$getAuth();
      Auth.getCredentials($rootScope.user.uid).then(function(data) {
        $rootScope.userCredentials = data;
        if(!$rootScope.userCredentials.feed){
          $rootScope.userCredentials.feed = new Array({subCat:"sign up", category:"setup",action:"created", value: null, detail:"Created New Account", date: new Date().getTime()});
          $rootScope.userCredentials.$save().then(function(){
            $rootScope.$broadcast('credentials available');
          });
        }else{
          $rootScope.$broadcast('credentials available');
        }
      });
    }
  });


})



.filter('range', function() {
    return function (input, total) {
      total = parseInt(total);
      for (var i = 0; i < total; i++)
        input.push(i);
      return input;
    };
  })



.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'AppCtrl'
  })

    .state('app.home', {
      url: '/home',
      views: {
        'menuContent': {
          templateUrl: 'templates/home.html',
          controller: 'AppCtrl'
        }
      }
    })

    .state('app.signup', {
      url: '/signup',
      views: {
        'menuContent': {
          templateUrl: 'templates/signup.html',
          controller: 'SignupCtrl'
        }
      }
    })

    .state('app.login', {
      url: '/login',
      views: {
        'menuContent': {
          templateUrl: 'templates/login.html',
          controller: 'LoginCtrl'
        }
      }
    })

    .state('app.setup', {
      url: '/setup',
      views: {
        'menuContent': {
          templateUrl: 'templates/setup.html',
          controller: 'SetupCtrl',
          authRequired: 'true'
        }
      }
    })
    .state('app.setupuser', {
      url: '/setup/user',
      views: {
        'menuContent': {
          templateUrl: 'templates/setup.user.html',
          controller: 'SetupUserCtrl',
          authRequired: 'true'
        }
      }
    })
    .state('app.setuptests', {
      url: '/setup/tests',
      views: {
        'menuContent': {
          templateUrl: 'templates/setup.tests.html',
          controller: 'SetupTestsCtrl',
          authRequired: 'true'
        }
      }
    })
    .state('app.setuptanks', {
      url: '/setup/tanks',
      views: {
        'menuContent': {
          templateUrl: 'templates/setup.tanks.html',
          controller: 'SetupTanksCtrl',
          authRequired: 'true'
        }
      }
    })
    .state('app.watertests', {
      url: '/watertests',
      views: {
        'menuContent': {
          templateUrl: 'templates/watertests.html',
          controller: 'WatertestsCtrl',
          authRequired: 'true'
        }
      }
    })

    .state('app.watertest', {
      url: '/watertests/watertest',
      views: {
        'menuContent': {
          templateUrl: 'templates/watertest.html',
          controller: 'WatertestCtrl',
          authRequired: 'true'
        }
      }
    })
    .state('app.report', {
      url: '/watertests/report',
      views: {
        'menuContent': {
          templateUrl: 'templates/report.html',
          controller: 'ReportCtrl',
          authRequired: 'true'
        }
      }
    })
      .state('app.summary', {
        url: '/watertests/summary',
        views: {
          'menuContent':{
            templateUrl: 'templates/summary.html',
            controller: 'SummaryCtrl',
            authRequired: 'true'
          }
        }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
});
