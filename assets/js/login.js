//Error Message Counter
var errorMessageCount = 0 ;

//Check if Token Exists
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
		}
	});
}

//Form Validation
$('.ui.form')
.form({
	fields: {
		username: {
			rules: [
			{
				type   : 'empty',
				prompt : 'Email cannot be empty, please enter your email'
			}]
		},
		password: {
			rules: [
			{
				type   : 'empty',
				prompt : 'Password cannot be empty, please enter your password'
			}]
		}
	}
});

//Form Submit
$('#loginForm').on('submit', function(e)
{
	//Prevent Default Action 
	e.preventDefault();

	//If form is valid
	if( $('.ui.form').form('is valid'))
	{
		//Fetch Credentials
		var username = $("input#username").val();
		var password = $("input#password").val(); 

		//Generate Auth Token
		function make_base_auth(username, password)
		{
			var tok = username + ':' + password;
			var hash = btoa(tok);
			return "Basic " + hash;
		}
		$.ajax
		({
			type: "GET",
			url: apiUrl + '/auth/login',
			dataType: 'json',
			async: false,
			credentials: 'same-origin',
			data: '{}',
			beforeSend: function (xhr)
			{
				xhr.setRequestHeader('Authorization', make_base_auth(username, password)); 
			},
			success: function (response)
			{
				//Set Token in Session
				sessionStorage.setItem("token",response.token);

				//Redirect to Dashboard
				window.location.href = "dashboard.html";
			},
			error : function (response)
			{
				if(response.status==0)
				{
					//Update Error Description
					$('#loginError').html('Could Not Connect');
					$('#errorDescription').html('The server might be offline or down for maintenance');
				}
				else
				{
					//Update Error Description
					$('#loginError').html('Authentication Error');
					$('#errorDescription').html(response.responseText);
				}
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
			}
		});
	}
})

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