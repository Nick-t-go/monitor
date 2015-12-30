angular.module('starter.controllers', ['app.factories'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

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

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('WatertestsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'New Report', id: "watertest" },
    { title: 'Summary', id: "summary" },
    { title: 'Reports', id: "report" },
    { title: 'To Do', id: 4 }
  ];

})

.controller('WatertestCtrl', function($scope, $stateParams, Tests, $state, $ionicHistory) {
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
        Tests.addToFire('goldfish', test.type, test.value, $scope.time)
      });
      obj2.forEach(function (test) {
        Tests.addToFire('tilapia', test.type, test.value, $scope.time)
      });

      Tests.recordTime($scope.time);

      $ionicHistory.goBack();
    }


})

.controller('SummaryCtrl', function($scope, Tests) {
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
      Tests.getOneTest(fish, testType)
        .then(function(result){
          $scope.data[0].values = result.map(function(test){
            return [test.date, parseInt(test.val)]
          });
        })
    }


})



.controller('ReportCtrl', function($scope, $stateParams, Tests, $log, $ionicHistory) {

    $scope.fishes = ['tilapia', 'goldfish'];
    $scope.dates = [];

    Tests.getDates()
      .then(function(times){
        times.forEach(function(time){
          $scope.dates.push(time.$id)
        })
      });

    $scope.getReport = function(fish, date){
      console.log(fish, date);
      Tests.getTestsByDate(fish, date)
        .then(function(result){
          console.log(result);
          $scope.report = result
        })
    };




});

