angular.module('starter.controllers', ['app.factories'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, Auth, Tests, $rootScope, $cordovaToast) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });


  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };


  $scope.doLogin = function(user) {
    Auth.$authWithPassword({email: user.email, password: user.password})
      .then(function(authData) {
        console.log(authData);
        $scope.loginData = null;
        $scope.modal.hide();

        // User successfully logged in
      }).catch(function(error) {
          console.log(error);
      });
  };

    $scope.doLogOut = function() {
      Auth.$unauth();
    };




  // Google Oauth
  $scope.gLogin = function() {
    console.log('ingLogin')
    Auth.$authWithOAuthRedirect("google").then(function(authData) {
      // User successfully logged in
    }).catch(function(error) {
      if (error.code === "TRANSPORT_UNAVAILABLE") {
        Auth.$authWithOAuthPopup("google").then(function(authData) {
          $rootScope.user = authData;
          console.log(authData);
        });
      } else {
        // Another error occurred
        console.log(error);
      }
    });

  };


  //Next thing after auth occurs
  Auth.$onAuth(function(authData) {
    if (authData === null) {
      console.log("Not logged in yet");
    } else {
      console.log("Logged in as", authData);
      $rootScope.user = authData

    }
    $scope.authData = authData;
  });



  //Sign UpModal Initialize
  $ionicModal.fromTemplateUrl('templates/signup.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.signupModal = modal;
  });

  //Methods and properties for SignUp
  $scope.mismatch = false;

  $scope.signup = function() {
    //$scope.modal.hide();
    $scope.signupModal.show();
  };

  $scope.closeSignUp = function(){
    $scope.signupModal.hide();
  };


  $scope.newUserSubmit = function(newUser){

    if(!newUser || !newUser.password || newUser.password !== newUser.passwordRe || !newUser.email){
      $scope.mismatch = true;
    }
    else {
      $cordovaToast.show("User Successfully Created, Now Login", 'long', 'top').then(function(success) {
        console.log("The toast was shown");
      }, function (error) {
        console.log("The toast was not shown due to " + error);
      });
      Tests.addNewUser(newUser);
      $scope.signupModal.hide();
      }
  };





})

.controller('WatertestsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'New Report', id: "watertest", icon: "ion-erlenmeyer-flask" },
    { title: 'Summary', id: "summary", icon: "ion-ios-list-outline" },
    { title: 'Reports', id: "report", icon: "ion-stats-bars" },
    { title: 'To Do', id: 4, icon:"ion-android-create"}
  ];

})

.controller('WatertestCtrl', function($scope, $stateParams, Tests, $state, $ionicHistory, $rootScope) {
    $scope.tanks = ['Gold Fish', 'Tilapia'];

    $scope.time = new Date().getTime();


    $scope.tilapiaTests = [
      {type : 'Temperature', min: 32, max: 100, step:.5, value: 0},
      {type : "PH", min:5, max: 9, step:.5, value: 0},
      {type : 'Ammonia', min: 0, max:8, step:.25,value: 0},
      {type : 'Phosphate', min:0, max: 10, step:.25,value: 0},
      {type : 'Nitrite', min:0, max: 5, step:.25, value: 0},
      {type : 'Nitrate', min:0, max: 160, step: 5,value: 0}
      ];

    $scope.goldfishTests = [
      {type : 'Temperature', min: 32, max: 100, step:.5, value: 0},
      {type : "PH", min:5, max: 9, step:.5, value: 0},
      {type : 'Ammonia', min: 0, max:8, step:.25,value: 0},
      {type : 'Phosphate', min:0, max: 10, step:.25,value: 0},
      {type : 'Nitrite', min:0, max: 5, step:.25, value: 0},
      {type : 'Nitrate', min:0, max: 160, step: 5,value: 0}
    ];

    $scope.submitForm = function(obj1, obj2) {
      obj1.forEach(function (test) {
        Tests.addToFire('goldfish', test.type, test.value, $scope.time, $rootScope.user.uid)
      });
      obj2.forEach(function (test) {
        Tests.addToFire('tilapia', test.type, test.value, $scope.time, $rootScope.user.uid)
      });

      Tests.recordTime($scope.time,$rootScope.user.uid);

      $ionicHistory.goBack();
    }


})

.controller('SummaryCtrl', function($scope, Tests, $rootScope) {
    $scope.fishes = ['tilapia', 'goldfish'];

    $scope.testTypes = [
      {type : 'Temperature'},
      {type : "PH"},
      {type : 'Ammonia'},
      {type : 'Phosphate'},
      {type : 'Nitrite'},
      {type : 'Nitrate'}
    ];

    $scope.fishes = ['tilapia', 'goldfish'];

    $scope.options = {
      chart: {
        type: 'discreteBarChart',
        height: 450,
        margin : {
          top: 20,
          right: 20,
          bottom: 65,
          left: 50
        },
        x: function(d){return d[0];},
        y: function(d){return d[1]/3;},
        showValues: true,
        valueFormat: function(d){
          return d3.format(',.1f')(d);
        },
        duration: 100,
        xAxis: {
          axisLabel: 'X Axis',
          tickFormat: function(d) {
            return d3.time.format("%d %b")(new Date(d))
          },
          rotateLabels: 90,
          showMaxMin: false
        },
        yAxis: {
          axisLabel: 'Y Axis',
          axisLabelDistance: -10,
          tickFormat: function(d){
            return d3.format(',.1f')(d);
          }
        },
        tooltip: {
          keyFormatter: function(d) {
            return d3.time.format("%d %b")(new Date(d));
          }
        },
        zoom: {
          enabled: true,
          scaleExtent: [1, 10],
          useFixedDomain: false,
          useNiceScale: false,
          horizontalOff: false,
          verticalOff: true,
          unzoomEventType: 'dblclick.zoom'
        }
      }
    };

    $scope.data = [
      {
        "key" : "Quantity" ,
        "bar": true,
        "values" : []
      }];

    $scope.summarize = function(fish, testType){
      console.log($scope.data);
      Tests.getOneTest(fish, testType, $rootScope.user.uid)
        .then(function(result){
          $scope.data[0].values = result.map(function(test){
            return [test.date, parseInt(test.val)]
          });
        })
    }


})



.controller('ReportCtrl', function($scope, $stateParams, Tests, $log, $ionicHistory, $rootScope) {

    $scope.fishes = ['tilapia', 'goldfish'];
    $scope.dates = [];

    Tests.getDates($rootScope.user.uid)
      .then(function(times){
        times.forEach(function(time){
          $scope.dates.push(time.$id)
        })
      });

    $scope.getReport = function(fish, date){
      console.log(fish, date);
      Tests.getTestsByDate(fish, date, $rootScope.user.uid)
        .then(function(result){
          console.log(result);
          $scope.report = result
        })
    };




});

