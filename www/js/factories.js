angular.module('app.factories', [])

  .factory("Auth", function($firebaseArray, $firebaseAuth, Tests) {
    return {
      getAuth: function () {
        var usersRef = new Firebase("https://domemonitor.firebaseio.com/");
        return $firebaseAuth(usersRef);
      },

      addNewUser: function(user){
        var ref = new Firebase('https://domemonitor.firebaseio.com/');
        var authObject = $firebaseAuth(ref);
        return authObject.$createUser({email: user.email,password: user.password})
          .then(function(userData) {
            console.log("User " + userData.uid + " created successfully!");
          })
          .catch(function(error) {
            console.error("Error: ", error);
          });
      }
    };


  })


  .factory('Tests', ['$firebaseArray', '$firebaseObject', function($firebaseArray, $firebaseObject){
    return {

      addToFire: function (tank, test, value, time, uid) {
        var ref = new Firebase('https://domemonitor.firebaseio.com/users/'+uid+'/tests');
        var array = $firebaseArray(ref);
        array.$add({
          date: time,
          val: value,
          'tank': tank,
          'test': test,
          'uid':uid
        });
      },

      createTest: function(newTest, uid){
        var testTypeRef = new Firebase('https://domemonitor.firebaseio.com/users/'+uid+'/testTypes');
        var test = {
          min: newTest.min,
          max: newTest.max,
          type: newTest.name,
          step: newTest.step,
          colors: newTest.colors,
          value: 0
        };
        testTypeRef.child(test.type).set(test);
      },

      deleteTest: function(type, uid){
        var deleteRef = new Firebase('https://domemonitor.firebaseio.com/users/' + uid + '/testTypes/' +type);
        var deleteObj = $firebaseObject(deleteRef);
        deleteObj.$loaded().then(function() {
          deleteObj.$remove()
            .then(function (ref) {
            })
            .catch(function (error) {
              console.log(error);
            });
        });
      },


      recordTime: function(time, uid){
        var ref2 = new Firebase('https://domemonitor.firebaseio.com/users/' + uid + '/dates');
        ref2.child(time).set(true);
      },

      getOneTest: function(tank, testType, uid){
        var ref = new Firebase('https://domemonitor.firebaseio.com/users/' + uid + '/tests');
        var array = $firebaseArray(ref);
        return array.$loaded()
          .then(function(){
            return array.filter(function(el){
              return el.tank === tank && el.test === testType;
            });
          });
      },

      getDates: function (uid) {
        var ref = new Firebase('https://domemonitor.firebaseio.com/users/'+uid+'/dates');
        var datesArray = $firebaseArray(ref);
        return datesArray.$loaded()
          .then(function(){
            return datesArray;
          });
      },

      getTestTypes: function (uid) {
        var ref = new Firebase('https://domemonitor.firebaseio.com/users/'+uid+'/testTypes');
        var testTypeArray = $firebaseArray(ref);
        return testTypeArray.$loaded()
          .then(function(){
            return testTypeArray;
          });
      },

      getTanks: function (uid) {
        var ref = new Firebase('https://domemonitor.firebaseio.com/users/'+uid+'/tanks');
        var tankArray = $firebaseArray(ref);
        return tankArray.$loaded()
          .then(function(){
            return tankArray;
          });
      },

      deleteTank: function(tank, uid){
        var deleteRef = new Firebase('https://domemonitor.firebaseio.com/users/' + uid + '/tanks/' +tank.name);
        var deleteObj = $firebaseObject(deleteRef);
        deleteObj.$loaded().then(function() {
          deleteObj.$remove()
            .then(function (ref) {
            })
            .catch(function (error) {
              console.log(error);
            });
        });

      },

      editTank: function(newTank,uid){
        var editRef = new Firebase('https://domemonitor.firebaseio.com/users/' + uid + '/tanks/' +newTank.$id);
        var obj = $firebaseObject(editRef);
        obj.name = newTank.name;
        obj.$id = newTank.name;
        obj.tests = 'all';
        obj.$save().then(function(ref) {
        }, function(error) {
          console.log("Error:", error);
        });
      },

      createNewTank: function(name, uid){
        var tankRef = new Firebase('https://domemonitor.firebaseio.com/users/' + uid + '/tanks');
        var tankToCreate = {
          name: name,
          type: name,
          tests: 'all'
        };
        tankRef.child(name).set(tankToCreate);
      },

      getTestsByDate: function(tank, date, uid){
        var ref1 = new Firebase('https://domemonitor.firebaseio.com/users/'+uid+'/tests/');
        var testArray = $firebaseArray(ref1);
        return testArray.$loaded()
          .then(function(){
            return testArray.filter(function(test){
              return test.tank === tank && test.date == date;
            });
          });
      },

      loadDefaults: function(uid){
        var userRef = new Firebase('https://domemonitor.firebaseio.com/users/' + uid + '/testTypes');
        var userArray = $firebaseArray(userRef);
        if (userArray.length > 0){
          return ;
        }
        [{type: 'Temperature', min: 32, max: 100, step: 0.5, value: 0, colors:['#CC00FF' ,'#CC0000']},
          {type: "PH", min: 5, max: 9, step: 0.5, value: 0, colors:['#B33D13', '#B6A33E', '#737F02', '#276011', '#0A341D', '#09353E', '#072075']},
          {type: 'Ammonia', min: 0, max: 8, step: 0.25, value: 0, colors:['#FBFD48','#F4FD37', '#DFFC38', '#86F830', '#58DA38', '#34C642', '#1D724B']},
          {type: 'Phosphate', min: 0, max: 10, step: 0.25, value: 0, colors:['#F7F7B5', '#F7FBAC', '#DFEA99', '#C7F4A8','#A4E6BC','#3F565A', '#16384F']},
          {type: 'Nitrite', min: 0, max: 5, step: 0.25, value: 0, colors:['#92DBEA' ,'#C9AEEC','#C0ACF1','#CB88ED', '#E169E3', '#B558A7']},
          {type: 'Nitrate', min: 0, max: 160, step: 5, value: 0, colors:['#FBFD3A', '#FAEE41', '#F48938', '#EF4038', '#EB3142', '#EA415C', '#9F122E']}
        ].forEach(function(test){
            userRef.child(test.type).set(test);
          });
        var tankRef = new Firebase('https://domemonitor.firebaseio.com/users/' + uid + '/tanks');
        [{name:'tank1', tests: 'all'},{name:'tank2', tests:'all'}].forEach(function(tank){
          tankRef.child(tank.name).set(tank);
        });
      }
    };
  }]);
