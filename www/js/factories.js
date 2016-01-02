angular.module('app.factories', [])

  .factory("Auth", function($firebaseAuth) {
    var usersRef = new Firebase("https://domemonitor.firebaseio.com/users");
    return $firebaseAuth(usersRef);
  })

  .factory('Tests', ['$firebaseArray', function($firebaseArray){
    return {

      addToFire: function (fish, test, value, time) {
        var ref = new Firebase('https://domemonitor.firebaseio.com/tests');
        var array = $firebaseArray(ref);
        array.$add({
          date: time,
          val: value,
          'fish': fish,
          'test': test
        });
      },

      addNewUser: function(user){
        var ref = new Firebase('https://domemonitor.firebaseio.com/users');
        ref.createUser({
          username:user.username,
          email: user.email,
          password: user.password
        }, function(error, userData) {
          if (error) {
            switch (error.code) {
              case "EMAIL_TAKEN":
                return "The new user account cannot be created because the email is already in use."
                break;
              case "INVALID_EMAIL":
                return "The specified email is not a valid email.";
                break;
              default:
                return "Error creating user:" + error;
            }
          } else {
            console.log("Successfully created user account with uid:", userData.uid);
            return userData
          }
        })
      },

      recordTime: function(time){
        var ref2 = new Firebase('https://domemonitor.firebaseio.com/dates');
        ref2.child(time).set(true);
        //var array2 = $firebaseArray(ref2);
        //array2.$add(time);
      },

      getOneTest: function(fish, testType){
        var ref = new Firebase('https://domemonitor.firebaseio.com/tests');
        var array = $firebaseArray(ref);
        return array.$loaded()
          .then(function(){
            return array.filter(function(el){
              return el.fish === fish && el['test'] === testType;
            });
          })
      },

      getDates: function () {
        var ref = new Firebase('https://domemonitor.firebaseio.com/dates');
        var datesArray = $firebaseArray(ref);
        return datesArray.$loaded()
          .then(function(){
            return datesArray
          })
      },

      getTestsByDate: function(fish, date){
        var ref1 = new Firebase('https://domemonitor.firebaseio.com/tests');
        var testArray = $firebaseArray(ref1);
        return testArray.$loaded()
          .then(function(){
            return testArray.filter(function(test){
              return test.fish === fish && test.date == date;
            });
          })
      }



    }
  }]);
