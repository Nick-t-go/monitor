angular.module('starter.controllers', ['app.factories'])

.controller('AppCtrl', function($scope, $state, $ionicModal, $timeout, Auth, Tests, $rootScope, $cordovaToast) {

  // Open the login modal
  $scope.login = function() {
    $state.go('app.login');
  };

  $scope.signup = function() {
    $state.go('app.signup');
    //$scope.modal.hide();
  };

})

.controller('SignupCtrl', function($scope, $ionicHistory, $ionicModal, $timeout, Auth, Tests, $rootScope, $cordovaToast){

      $scope.title = "Log Out";


    $scope.closeSignUp = function(){
      $scope.signupModal.hide();
    };

    $scope.newUserTest = true;


    $scope.newUserSubmit = function(newUser){
      if(!newUser || !newUser.password || newUser.password !== newUser.passwordRe || !newUser.email){
        $scope.mismatch = true;
      } else {
        return Auth.addNewUser(newUser)
          .then(function(){
            return Auth.getAuth().$authWithPassword({email: newUser.email, password: newUser.password})
              .then(function(authData){
                  $rootScope.user = authData;
                  $rootScope.authData = authData;
                  console.log("client", authData);
                  Tests.loadDefaults(authData.uid);
                  $scope.newUser = null;
                  $ionicHistory.goBack();
                  $cordovaToast.show("User Successfully Created, And You Are Now Logged In", 'long', 'top').then(function(success) {
                    console.log("The toast was shown");
                  }, function (error) {
                    console.log("The toast was not shown due to " + error);
                  });
              });
          });
      }
    };
  })

.controller('LoginCtrl', function($scope, $state, $ionicModal, $timeout, Auth, Tests, $rootScope, $cordovaToast) {

    $scope.loginData = {};

    $scope.doLogin = function(user) {
      Auth.getAuth().$authWithPassword({email: user.email, password: user.password})
        .then(function(authData) {
          console.log(authData);
          $scope.loginData = null;
          $cordovaToast.show("You Are Now Logged In", 'long', 'top').then(function(success) {
            console.log("The toast was shown");
          }, function (error) {
            console.log("The toast was not shown due to " + error);
          });
          // User successfully logged in
        }).catch(function(error) {
          console.log(error);
        });
    };

    $scope.doLogOut = function() {
      $rootScope.user = null;
      $rootScope.authData = null;
      Auth.getAuth().$unauth();
    };




    // Google Oauth
    $scope.gLogin = function() {
      Auth.getAuth().$authWithOAuthRedirect("google").then(function(authData) {
        // User successfully logged in
      }).catch(function(error) {
        if (error.code === "TRANSPORT_UNAVAILABLE") {
          Auth.getAuth().$authWithOAuthPopup("google").then(function(authData) {
            console.log("autheticated");
          });
        } else {
          console.log(error);
        }
      });

    };


    //Next thing after auth occurs
    Auth.getAuth().$onAuth(function(authData) {
      if (authData === null) {
        console.log("Not logged in yet");
      } else {
        $rootScope.user = authData;
        $rootScope.authData = authData;
      }
    });


    $scope.signup = function() {
      $state.go('app.signup');
      //$scope.modal.hide();
    };


  })

.controller('SetupCtrl', function($scope, $rootScope) {
  $scope.setupMenu = [
    //{ title: 'User Setup', id: "user", icon: "ion-person" },
    { title: 'Test Setup', id: "tests", icon: "ion-aperture" },
    { title: 'Tank Setup', id: "tanks", icon: "ion-waterdrop" }
  ];



})

.controller('SetupTanksCtrl', function($scope, $rootScope, Tests, $ionicPopup, $ionicHistory, $cordovaToast) {

    $scope.tanks = [];
    $scope.edit = false;
    $scope.oldTank = 'start';


    $scope.startEdit = function(tank,index){
      $scope.edit = !$scope.edit;
      if (tank.name != tank.$id){
        $scope.tanks[index].name = tank.$id;
      }
    };

    $scope.editSubmit=function(newTank){
      $scope.edit = !$scope.edit;
      Tests.editTank(newTank, $rootScope.user.uid);
    };

    $scope.createSubmit=function(tankName){
      Tests.createNewTank(tankName, $rootScope.user.uid);
      $cordovaToast.show("New Tank Created", 'long', 'top').then(function(success) {
        console.log("The toast was shown");
      }, function (error) {
        console.log("The toast was not shown due to " + error);
      });
      $ionicHistory.goBack();
    };

    Tests.getTanks($rootScope.user.uid)
      .then(function(tanks){
        tanks.forEach(function(tank){
          $scope.tanks.push(tank);
        });
      });

    $scope.confirmDelete = function(tankDelete) {
      var deletePopup = $ionicPopup.confirm({
        title: 'Delete Tank',
        template: 'Are you sure you want to delete '+tankDelete.name+ '?',
        cancelType: 'button-energized',
        okType: 'button-assertive'
      });

      deletePopup.then(function(res) {
        if(res) {
          var tempTanks = $scope.tanks;
          $scope.tanks = tempTanks.filter(function(tank){
            return tank.name != tankDelete.name;
          });
          Tests.deleteTank(tankDelete, $rootScope.user.uid);
          $cordovaToast.show("Tank Deleted", 'long', 'top').then(function(success) {
            console.log("The toast was shown");
          }, function (error) {
            console.log("The toast was not shown due to " + error);
          });
        } else {
          console.log('You are not sure');
        }
      });
    };


})

.controller('SetupTestsCtrl', function($scope, Tests, $rootScope, $ionicPopup, $ionicHistory, $cordovaToast) {

    $scope.tank = [];
    $scope.test = [];
    $scope.testColors = [];
    $scope.myTests = [];

    console.log($rootScope.user.uid);

    Tests.getTestTypes($rootScope.user.uid)
      .then(function(testTypes){
        testTypes.forEach(function(type){
          $scope.myTests.push(type);
        });
      });


    $scope.testCreate = function(newTest, colors){
      newTest.colors = colors;
      Tests.createTest(newTest, $rootScope.user.uid);
      $cordovaToast.show("Test Created", 'long', 'top').then(function(success) {
        console.log("The toast was shown");
      }, function (error) {
        console.log("The toast was not shown due to " + error);
      });
      $ionicHistory.goBack();
    };

    $scope.msgMin = 'Set the minimum value in your test';
    $scope.msgMax = 'Set the maximum value in your test';
    $scope.msgStep = 'Set the smallest increment of each slide';
    $scope.msgColor = 'Set two or more colors to represent color scale of test';

    $scope.showInfo = function(msg) {
      var infoPopup = $ionicPopup.alert({
        title: 'Info',
        template: msg
      });
      infoPopup.then(function(res) {
      });
    };

    $scope.confirmDelete = function(type) {
      var deletePopup = $ionicPopup.confirm({
        title: 'Delete Test',
        template: 'Are you sure you want to delete '+type+ ' test?',
        cancelType: 'button-energized',
        okType: 'button-assertive'
      });

      deletePopup.then(function(res) {
        if(res) {
          var tempTests = $scope.myTests;
          $scope.myTests = tempTests.filter(function(test){
            return test.type != type;
          });
          Tests.deleteTest(type, $rootScope.user.uid);
          $cordovaToast.show("Test Deleted", 'long', 'top').then(function(success) {
            console.log("The toast was shown");
          }, function (error) {
            console.log("The toast was not shown due to " + error);
          });
        } else {
          console.log('You are not sure');
        }
      });
    };

  })

.controller('WatertestsCtrl', function($scope) {
  $scope.waterTestMenu = [
    { title: 'New Report', id: "watertest", icon: "ion-erlenmeyer-flask" },
    { title: 'Summary', id: "summary", icon: "ion-stats-bars" },
    { title: 'Reports', id: "report", icon: "ion-ios-list-outline" }
   // { title: 'To Do', id: 4, icon:"ion-android-create"}
  ];

})

.controller('WatertestCtrl', function($scope, $stateParams, Tests, $state, $ionicHistory, $rootScope, $cordovaToast) {
    $scope.tanks = [];
    $scope.tests = [];


    Tests.getTestTypes($rootScope.user.uid)
      .then(function(testTypes){
        testTypes.forEach(function(type){
          $scope.tests.push(type);
        });
      });

    Tests.getTanks($rootScope.user.uid)
      .then(function(tanks){
        tanks.forEach(function(tank){
          $scope.tanks.push(tank.$id);
        });
      });

    $scope.time = new Date().getTime();



    $scope.submitForm = function(tank, testsResults) {
      testsResults.forEach(function (testResult) {
        Tests.addToFire(tank, testResult.type, testResult.value, $scope.time, $rootScope.user.uid);
      });

      Tests.recordTime($scope.time,$rootScope.user.uid);

      $cordovaToast.show("New Report Submitted", 'long', 'top').then(function(success) {
        console.log("The toast was shown");
      }, function (error) {
        console.log("The toast was not shown due to " + error);
      });

      $ionicHistory.goBack();
    };


})

.controller('SummaryCtrl', function($scope, Tests, $rootScope) {
    $scope.fishes = ['tilapia', 'goldfish'];

    $scope.testTypes = [];
    $scope.tanks = [];


    Tests.getTestTypes($rootScope.user.uid)
      .then(function(testTypes){
        testTypes.forEach(function(type){
          $scope.testTypes.push(type.$id);
        });
      });

    Tests.getTanks($rootScope.user.uid)
      .then(function(tanks){
        tanks.forEach(function(tank){
          console.log(tank);
          $scope.tanks.push(tank.$id);
        });
      });


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
          axisLabel: '',
          tickFormat: function(d) {
            return d3.time.format("%d %b")(new Date(d));
          },
          rotateLabels: 90,
          showMaxMin: false
        },
        yAxis: {
          axisLabel: 'value',
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

    $scope.summarize = function(tank, testType){
      console.log(tank, testType, $rootScope.user.uid);
      Tests.getOneTest(tank, testType, $rootScope.user.uid)
        .then(function(result){
          $scope.data[0].values = result.map(function(test){
            return [test.date, parseInt(test.val)];
          });
        });
    };


})



.controller('ReportCtrl', function($scope, $stateParams, Tests, $log, $ionicHistory, $rootScope) {

    $scope.tanks = [];
    $scope.dates = [];

    Tests.getDates($rootScope.user.uid)
      .then(function(times){
        times.forEach(function(time){
          $scope.dates.push(time.$id);
        });
      });

    Tests.getTanks($rootScope.user.uid)
      .then(function(tanks){
        tanks.forEach(function(tank){
          console.log(tank);
          $scope.tanks.push(tank.$id);
        });
      });

    $scope.getReport = function(fish, date){
      console.log(fish, date);
      Tests.getTestsByDate(fish, date, $rootScope.user.uid)
        .then(function(result){
          console.log(result);
          $scope.report = result;
        });
    };




});

