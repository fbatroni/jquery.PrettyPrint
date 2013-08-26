var currentButton;
jQuery(document).ready(function($) {
	

	console.log($('<span>19172915910</span>').PrettyPrint('phone', {detailed: true}));

	$('button').click(function(event) {
		currentButton = $(this);
		var function_to_execute = $(this).attr('id');
		if(function_to_execute !== 'test_sms_message'){
			$('.test-data').hide();
		}else{
			$('.test-data').show();
		}
		$('.test-message').removeClass('error').removeClass('success').empty();	
		$('.test-results').empty();
		$('#Canvas').empty();
		$('.sidebar span').remove();
		event.preventDefault();
		event.stopPropagation();
		
		console.log("function to execute: " + function_to_execute);
		var call = eval(function_to_execute);
		call(function_to_execute);
		return false;
	});
	$("#phone").keypress(function() {
	    if ( event.which == 13 ) {
		     event.preventDefault();
		   }
	});

	$('.icon-reorder').click(function() {
		$(this).parent().toggleClass('show-hide-sidebar');
	});

	$('#detailed').on('click', function(){
		displayPhoneNumberResult();
	});
});		
var test_pretty_print = function(){
	$('.test-data').show();
	$('#phone_test').show();
	$('#phone').val('19172915910');
	displayPhoneNumberResult();
	$('#test_pretty_print_button').click(function(){
		displayPhoneNumberResult();
	});
}


var displayPhoneNumberResult = function(){
	var detailed = $('#detailed').prop("checked") ? true : false;
	$('.test').PrettyPrint("phone", {auto: true});
		if(detailed == false){
		$('#Canvas').html($('#phone').PrettyPrint("phone", {}));
	}else{
		var json = $('#phone').PrettyPrint("phone", {detailed: true});
		$('#Canvas').empty();
		Process(json);
	}
}
var test_auto_format = function(){
	$('.test-data').show();
	$('#phone_test').hide();
	$('.Canvas').load('/testpages/phoneNumbers.html', function(){
		$('.glg-phone').PrettyPrint("phone", {auto: true});
	});

}

