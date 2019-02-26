//Navbar Scroll Background Change
$(function ()
{
  $(document).scroll(function () {
	  var $nav = $(".navContainer");
	  $nav.toggleClass('scrolled', $(this).scrollTop() > $nav.height());
	});
});

//Shuffle Effect
$(document).ready(function()
{
	var $randomnbr = $('.nbr');
	var $timer = 100;
	var $it;
	var $data = 0;
	var index;
	var change;
	var letters = ["b", "i", "l", "o", "n", "z"];
	$randomnbr.each(function()
	{
		change = Math.round(Math.random()*100);
		$(this).attr('data-change', change);
	});
	function random()
	{
		return Math.round(Math.random()*9);
	};
	function select()
	{
		return Math.round(Math.random()*$randomnbr.length+1);
	};
	function value()
	{
		$('.nbr:nth-child('+select()+')').html(''+random()+'');
		$('.nbr:nth-child('+select()+')').attr('data-number', $data);
		$data++;
		$randomnbr.each(function()
		{
			if(parseInt($(this).attr('data-number')) > parseInt($(this).attr('data-change')))
			{
				index = $('.ltr').index(this);
				$(this).html(letters[index]);
				$(this).removeClass('nbr');
			}
		});
	};
	$it = setInterval(value, $timer);
});

//Mobile Menu Trigger
$('#mobileOnly').click(function(){
	//$('.ui.basic.modal.editModal').modal('show').modal('setting', 'closable', false);
	$('.ui.basic.modal').modal('show').modal('setting', 'closable', false);
});

//Form Validation
$('.ui.form')
.form({
	fields: {
		name: {
			rules: [
			{
				type   : 'empty',
				prompt : 'Name cannot be empty, please enter a name'
			}]
		},
		email: {
			rules: [
			{
				type   : 'empty',
				prompt : 'Email cannot be empty, please enter your email'
			}]
		},
		phone: {
			rules: [
			{
				type   : 'number',
				prompt : 'Please enter a valid phone number, no characters allowed'
			},
			{
				type   : 'minLength[7]',
				prompt : 'Phone number is too short, please enter correctly'
			},
			{
				type   : 'maxLength[15]',
				prompt : 'Phone number is too large, please enter correctly'
			}]
		},
		password: {
			rules: [
			{
				type   : 'minLength[8]',
				prompt : 'Password should be minimum 8 characters long'
			}]
		},
		passwordConfirm: {
			rules: [
			{
				type   : 'match[password]',
				prompt : 'Passwords do not match, please re-check your password'
			},
			{
				type   : 'empty',
				prompt : 'Confirm Password cannot be empty'
			}]
		}
	}
});

//Error Message Counter
var errorMessageCount = 0;

//Form Submission
$('#signupForm').on('submit', function(e)
{
	//Prevent Default Action 
	e.preventDefault();

	//If form is valid
	if( $('.ui.form').form('is valid'))
	{
		//Send POST to Signup API
		var form = $(this);
		var formData = form.serializeArray() ;
		formData = _.object(_.pluck(formData, 'name'), _.pluck(formData, 'value'));
		formData = JSON.stringify(formData);
		
		$.ajax({
			type: 'POST',
			url: apiUrl + '/auth/signup',
			data: formData,
			dataType: 'json',
			contentType: "application/json; charset=utf-8",
			success: function (response)
			{
				//Set Token in Session
				sessionStorage.setItem("token",response.token);

				//Redirect to Dashboard
				window.location.href = "dashboard.html";
			},
			error: function (response)
			{
				//Update Error Description
				$('#errorDescription').html(response.token);

				//Check if Error Message is Previously Displayed
				if(errorMessageCount == 0)
				{
					//Display Error Message
					$('#errorMessage').transition({
						animation: 'swing down',
						duration   : '1s'
					});
					errorMessageCount++ ;
				}
			},
		});
	}
})

//Login Button Click
$("#loginButton").click(function()
{
	if(token)
	{
		$.ajax
		({
			type: "GET",
			url: apiUrl + '/subsystems/validate',
			dataType: 'json',
			async: false,
			credentials: 'same-origin',
			data: '{}',
			beforeSend: function (xhr)
			{
				xhr.setRequestHeader('x-access-token', token); 
			},
			complete: function (response)
			{
				//Redirect to Dashboard
				if(response.status == 200)
				{
					window.location.href = "dashboard.html";
				}
			},
			error: function()
			{
				window.location.href = "login.html";
			}
		});
	}
	else
	{
		window.location.href = "login.html";
	}
});