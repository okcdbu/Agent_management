$(function() {
	'use strict';
	
  $('.form-control').on('input', function() {
	  var $field = $(this).closest('.form-group');
	  if (this.value) {
	    $field.addClass('field--not-empty');
	  } else {
	    $field.removeClass('field--not-empty');
	  }
	});
	var forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  	Array.prototype.slice.call(forms)
    .forEach(function (form) {
      form.addEventListener('submit', function (event) {
      	if(document.getElementById("password").value !== document.getElementById("re-password").value){
      		$('#re-password').addClass('is-invalid')
      	}
      	else{
      		$('#re-password').removeClass('is-invalid')
		}
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }
        form.classList.add('was-validated')
      }, false)
    })
});

