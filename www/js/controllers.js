angular.module('starter.controllers', ['app.factories'])

.controller('AppCtrl', function($scope, $state, $ionicModal, $timeout, Auth, Tests, $rootScope, Init) {

  // Open the login modal
  $scope.login = function() {
    $state.go('app.login');
  };

  $scope.signup = function() {
    $state.go('app.signup');
  };

  $scope.initTanks = function(){
    Init.init($rootScope.user.uid, 'tanks');
    $state.go('app.setuptanks');
  };

  $scope.initTests = function(){
    Init.init($rootScope.user.uid, 'tests');
    $state.go('app.setuptests');
  };

  $scope.initUser = function(){
    Init.init($rootScope.user.uid, 'user');
    $state.go('app.setupuser');
  };

  $scope.firstTest = function(){
    Init.init($rootScope.user.uid, 'firstTest');
    $state.go('app.watertest');
  };

  $scope.doLogOut = function() {
    $rootScope.user = null;
    $rootScope.authData = null;
    Auth.getAuth().$unauth();
  };


  })

.controller('SignupCtrl', function($scope, $ionicHistory, $ionicModal, $timeout, Auth, Tests, $rootScope, $cordovaToast){


    $scope.newUserTest = true;
    $scope.mismatch =false;


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

.controller('LoginCtrl', function($scope, $state, $ionicModal, $timeout, Auth, Tests, $rootScope, $cordovaToast, $ionicLoading) {

    $scope.loginData = {};
    $scope.nope = false;

    $scope.doLogin = function(user) {
      $ionicLoading.show({
        content: 'Loading',
        template: '<ion-spinner icon="bubbles"></ion-spinner>',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
      });
      Auth.getAuth().$authWithPassword({email: user.email, password: user.password})
        .then(function(authData) {
          $state.go('app.home');
          console.log(authData);
          $scope.loginData = null;
          $scope.nope = false;
          $ionicLoading.hide();

          $cordovaToast.show("You Are Now Logged In", 'long', 'top').then(function(success) {
            console.log("The toast was shown");
          }, function (error) {
            console.log("The toast was not shown due to " + error);
          });
           //User successfully logged in
        }).catch(function(error) {
          console.log(error);
          $ionicLoading.hide();
          $scope.nope = true;

        });
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
    { title: 'User Preferences', id: "user", icon: "ion-person" },
    { title: 'Test Preferences', id: "tests", icon: "ion-aperture" },
    { title: 'Tank Preferences', id: "tanks", icon: "ion-waterdrop" }
  ];



})

  .controller('SetupUserCtrl', function($scope, $rootScope, $ionicPopup, Init) {


    $scope.editPopup = function(item) {
      $scope.data = {};
      var popup = $ionicPopup.show({
        template: '<input type="text" ng-model="data.new">',
        title: 'Edit ' + item,
        scope: $scope,
        buttons: [
          {text: 'Cancel'},
          {
            text: '<b>Save</b>', type: 'button-positive',
            onTap: function (e) {
              if (!$scope.data.new) {
                //don't allow the user to close unless info added
                e.preventDefault();
              } else {
                console.log($scope.data.new);
                $rootScope.userCredentials.username = $scope.data.new;
                $rootScope.userCredentials.$save()
                  .then(function(){
                    $rootScope.userCredentials.feed.push({subCat:"username", category:"setup",action:"edit", value: $scope.data.new, detail:"Username Changed to: "+ $scope.data.new, date: new Date().getTime()});
                    $rootScope.userCredentials.$save();
                  });
              }
            }
          }
        ]
      });
    };


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
      //Tests.createNewTank(tankName, $rootScope.user.uid);
      $scope.tanks.$add({
        name: tankName,
        type: tankName,
        tests: 'all'
      }).then(function() {
        $rootScope.userCredentials.feed.push({subCat:"tank", category:"setup",action:"created", value: tankName, detail:"Created Tank: "+ tankName, date: new Date().getTime()});
        $rootScope.userCredentials.$save();
        $cordovaToast.show("New Tank Created", 'long', 'top').then(function (success) {
        }, function (error) {
          console.log("The toast was not shown due to " + error);
        });
        $ionicHistory.goBack();
      });
    };

    Tests.getTanks($rootScope.user.uid)
      .then(function(tanks){
          $scope.tanks = tanks;
          console.log($scope.tanks);
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
        $scope.myTests = testTypes;
        console.log($scope.myTests);
      });


    $scope.testCreate = function(newTest, colors){
      newTest.colors = colors;
      $scope.myTests[newTest.name]={
        min: newTest.min,
        max: newTest.max,
        type: newTest.name,
        step: newTest.step,
        colors: newTest.colors,
        value: 0
      };
      $scope.myTests.$save()
        .then(function(){
          $rootScope.userCredentials.feed.push({subCat:"test", category:"setup",action:"created", value: newTest.name, detail:"Created Test: "+ newTest.name, date: new Date().getTime()});
          $rootScope.userCredentials.$save();
        });
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
    { title: 'Record New Test Results', id: "watertest", icon: "ion-erlenmeyer-flask" },
    { title: 'Summary', id: "summary", icon: "ion-stats-bars" },
    { title: 'Past Reports', id: "report", icon: "ion-ios-list-outline" }
   // { title: 'To Do', id: 4, icon:"ion-android-create"}
  ];

})

.controller('WatertestCtrl', function($scope, $stateParams, Tests, $state, $ionicHistory, $rootScope, $cordovaToast) {
    $scope.tanks = [];
    $scope.tests = [];
    $scope.clicked = false;


    Tests.getTestTypes($rootScope.user.uid)
      .then(function(testTypes){
        $scope.tests = testTypes;
      });

    Tests.getTanks($rootScope.user.uid)
      .then(function(tanks){
          $scope.tanks = tanks;
      });

    $scope.time = new Date().getTime();



    $scope.submitForm = function(tank, testsResults) {
      $scope.clicked = true;
      testsResults.forEach(function (testResult) {
        Tests.addToFire(tank, testResult.type, testResult.value, $scope.time, $rootScope.user.uid);
      });

      Tests.recordTime($scope.time,$rootScope.user.uid, tank);

      $rootScope.userCredentials.feed.push({subCat:"watertest", category:"watertests",action:"create", value: tank.$id, detail:"New Test Results Recorded", date: $scope.time});
      $rootScope.userCredentials.$save();


      $cordovaToast.show("New Report Submitted", 'long', 'top').then(function(success) {
        console.log("The toast was shown");
        $scope.clicked = false;
      }, function (error) {
        console.log("The toast was not shown due to " + error);
        $scope.clicked = false;
      });

      $ionicHistory.goBack();
    };


})

.controller('SummaryCtrl', function($scope, Tests, $rootScope) {

    $scope.testTypes = [];
    $scope.tanks = [];


    Tests.getTestTypes($rootScope.user.uid)
      .then(function(testTypes){
        $scope.testTypes = testTypes;
      });

    Tests.getTanks($rootScope.user.uid)
      .then(function(tanks){
        tanks.forEach(function(tank){
          console.log(tank);
          $scope.tanks.push(tank.name);
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



.controller('ReportCtrl', function($scope, $stateParams, Tests, $log, $ionicHistory, $rootScope,$ionicLoading) {

    $scope.tanks = [];
    $scope.dates = [];

    Tests.getDates($rootScope.user.uid)
      .then(function(times){
        times.forEach(function(time){
          $scope.dates.push({time:time.$id, tank:time.$value});
        });
      });

    $ionicLoading.show({
      content: 'Loading',
      template: '<ion-spinner icon="bubbles"></ion-spinner>',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });
    Tests.getTanks($rootScope.user.uid)
      .then(function(tanks){
          $scope.tanks = tanks;
          $ionicLoading.hide();
      });

    $scope.getReport = function(fish, date){
      console.log(fish, date);
      Tests.getTestsByDate(fish, date, $rootScope.user.uid)
        .then(function(result){
          console.log(result);
          $scope.report = result;
        });
    };




})

.controller('FeedCtrl', function($scope, $rootScope, $ionicPopup, $filter){

  $scope.$on('credentials available', function() {
    $scope.feed = $rootScope.userCredentials.feed;
    });
  $scope.show = function(item){
    var alertPopup = $ionicPopup.alert({
      title: 'Info',
      template: "On " + $filter('date')(item.date,'MM/dd/yyyy @ h:mma') + ': ' + item.detail
    });

    alertPopup.then(function(res) {
      console.log('More Options Coming Soon');
    });
  };
});

