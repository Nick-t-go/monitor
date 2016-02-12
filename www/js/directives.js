angular.module('starter.directives', [])

.directive('userFeed', function () {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'templates/feed.html',
      controller: 'FeedCtrl'
    };
});
