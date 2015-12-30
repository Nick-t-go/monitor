angular.module('app.factories', [])
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
