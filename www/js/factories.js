angular.module('app.factories', [])

  .factory("Auth", function($firebaseAuth) {
    var usersRef = new Firebase("https://domemonitor.firebaseio.com/");
    return $firebaseAuth(usersRef);
  })

  .factory('Tests', ['$firebaseArray', function($firebaseArray){
    return {

      addToFire: function (fish, test, value, time, uid) {
        var ref = new Firebase('https://domemonitor.firebaseio.com/users/'+uid+'/tests');
        var array = $firebaseArray(ref);
        array.$add({
          date: time,
          val: value,
          'fish': fish,
          'test': test,
          'uid':uid
        });
      },

      addNewUser: function(user){
        var ref = new Firebase('https://domemonitor.firebaseio.com/users');
        ref.createUser({
          email: user.email,
          password: user.password
        }, function(error, userData) {
          if (error) {
            switch (error.code) {
              case "EMAIL_TAKEN":
                return "The new user account cannot be created because the email is already in use.";
                break;
              case "INVALID_EMAIL":
                return "The specified email is not a valid email.";
                break;
              default:
                return "Error creating user:" + error;
            }
          } else {
            console.log("Successfully created user account with uid:", userData.uid);
            return "success"
          }
        })
      },

      recordTime: function(time, uid){
        var ref2 = new Firebase('https://domemonitor.firebaseio.com/users/' + uid + '/dates');
        ref2.child(time).set(true);
        //var array2 = $firebaseArray(ref2);
        //array2.$add(time);
      },

      getOneTest: function(fish, testType, uid){
        var ref = new Firebase('https://domemonitor.firebaseio.com/users/' + uid + '/tests');
        var array = $firebaseArray(ref);
        return array.$loaded()
          .then(function(){
            return array.filter(function(el){
              return el.fish === fish && el['test'] === testType;
            });
          })
      },

      getDates: function (uid) {
        var ref = new Firebase('https://domemonitor.firebaseio.com/users/'+uid+'/dates');
        var datesArray = $firebaseArray(ref);
        return datesArray.$loaded()
          .then(function(){
            console.log(datesArray)
            return datesArray
          })
      },

      getTestsByDate: function(fish, date, uid){
        var ref1 = new Firebase('https://domemonitor.firebaseio.com/users/'+uid+'/tests/');
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
