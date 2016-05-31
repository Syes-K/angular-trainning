/**
 * Created by yongsheng.kuang on 16/5/31.
 */
define([],function () {
    function AboutCtrl($scope,$state,email) {
        $scope.email=email;
    }
    myApp.registerController('AboutCtrl', AboutCtrl);
    AboutCtrl.$inject = ['$scope', '$state','email'];
});