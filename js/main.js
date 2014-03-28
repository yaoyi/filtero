Caman.DEBUG = true
var ngCaman = angular.module('caman', [])
ngCaman.controller('CamanCtrl', ['$scope', function($scope) {
	$scope.brightness = 0
	$scope.contrast = 0
	$scope.vignette = 0
	$scope.lightenCenter = 0

	

	function createHoverState (myobject){
    myobject.hover(function() {
      $(this).prev().toggleClass('hilite');
    });
    myobject.mousedown(function() {
      $(this).prev().addClass('dragging');
      $("*").mouseup(function() {
        $(myobject).prev().removeClass('dragging');
      });
    });
  }

  function updateState(){
  	console.log('hello')
  	var name = $(this).attr('name')
  	var value = $(this).slider("value")
  	// var caman
	// Caman("#example", function () {
 //  		this[name](parseInt(value)).render()
	// });
  
  }
  
  // $(".slider").slider({
  //   orientation: "horizontal",
  //   range: "min",
  //   min: -100,
  //   max: 100,
  //   value: 0,
  //   animate: 1300,
  //   change: updateState
  // });
  // $("#blue").slider( "value", 100 );
  // $('.slider').each(function(index) {
  //   $(this).slider( "value", 75-index*(50/($('.slider').length-1)));
  // });
  
  // createHoverState($(".slider a.ui-slider-handle"));
}])