//Local Variables
var numberOfActuators = 0 ;

//Redirect to Actuator Information
function exploreActuator(actuator_id)
{
	//Set Actuator ID in Session
	sessionStorage.setItem("actuator_id",actuator_id);
	
	//Redirect to Dashboard
	window.location.href = "actuatorInfo.html";
}

//Form Validation
$('.content.ui.form.createForm')
.form({
	fields: {
		name: {
			rules: [
			{
				type   : 'empty',
				prompt : 'Name cannot be empty, please enter a name'
			}]
		}
	}
});

// Create Actuator Form
$('#createForm').on('submit', function(e)
{
	//Prevent Default Action 
	e.preventDefault();

	//If form is valid
	if( $('.content.ui.form.createForm').form('is valid'))
	{
		//Serialize Form Data
		var form = $(this);
		var formData = form.serializeArray() ;
		formData = _.object(_.pluck(formData, 'name'), _.pluck(formData, 'value'));
		formDataJSON = formData ;
		formData = JSON.stringify(formData);

		console.log(formData);
		$.ajax({
			type: 'POST',
			url: apiUrl + '/subsystems/actuator',
			dataType: 'json',
			data: formData,
			contentType: "application/json; charset=utf-8",
			beforeSend: function (xhr)
			{
				xhr.setRequestHeader('x-access-token', token); 
			},
			success: function (response)
			{
				if(numberOfActuators > 0)
				{
					//Add Row in Actuator List
					$('.actuatorList').append(`
						<tr class="actuatorInfo" onclick="exploreActuator('`+ response.private_id +`')" style="cursor: pointer;">
							<td>`+ formDataJSON.name +`</td>
							<td>`+ formDataJSON.description +`</td>
							<td class="hideOnMobile">`+ response.private_id +`</td>
							<td class="hideOnMobile"></td>
						</tr>
					`);
				}
				else
				{
					//Add Row in Actuator List
					$('.actuatorList').html(`
						<tr class="actuatorInfo" onclick="exploreActuator('`+ response.private_id +`')" style="cursor: pointer;">
							<td>`+ formDataJSON.name +`</td>
							<td>`+ formDataJSON.description +`</td>
							<td class="hideOnMobile">`+ response.private_id +`</td>
							<td class="hideOnMobile"></td>
						</tr>
					`);
				}

				//Increase Count
				numberOfActuators++ ;

				//Reset Form
				$('.content.ui.form.createForm').form('reset');

				//Show Snackbar
				Snackbar.show({
					text: 'Actuator Added Successfully',
					pos: 'bottom-center'
				});
			},
			error: function (response)
			{
				Snackbar.show({
					text: 'Something went wrong, please try again later',
					pos: 'bottom-center',
					actionTextColor: 'rgba(255,90,100,1)'
				});
			}
		});
	}
});

// Populate Actuator List
$.ajax({
	type: 'GET',
	url: apiUrl + '/subsystems/actuator',
	dataType: 'json',
	data: '{}',
	beforeSend: function (xhr)
	{
		xhr.setRequestHeader('x-access-token', token); 
	},
	success: function (response)
	{
		//Check for action success
		if (response.action == true)
		{
			//Check if an actuator exists
			if (response.exists == true)
			{
				$.each(response.actuators,function(key,actuator)
				{
					$('.actuatorList').append(`
						<tr class="actuatorInfo" onclick="exploreActuator('`+ actuator.private_id +`')" style="cursor: pointer;">
							<td>`+ actuator.name +`</td>
							<td>`+ actuator.description +`</td>
							<td class="hideOnMobile">`+ actuator.private_id +`</td>
							<td class="hideOnMobile">`+ actuator.node_id +`</td>
						</tr>
					`);
					numberOfActuators++ ;
				});
			}
			else
			{
				$('.actuatorList').append(`
					<tr>
						<td colspan="4" style="text-align: center;">Looks like you don\'t have an actuator added yet</td>
					</tr>
				`);
			}
		}
	},
	error: function (response)
	{
		//Clear any existing variables from Session
		sessionStorage.clear();

		//Reditect to Landing Page
		window.location.href = "login.html";
	}
});