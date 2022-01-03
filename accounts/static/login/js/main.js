$(function() {
	'use strict';
	$('.forgot-pass').on('click',function(){
  	alert('관리자에게 문의하세요.');
  });
  $('.form-control').on('input', function() {
	  var $field = $(this).closest('.form-group');
	  if (this.value) {
	    $field.addClass('field--not-empty');
	  } else {
	    $field.removeClass('field--not-empty');
	  }
	});

});
