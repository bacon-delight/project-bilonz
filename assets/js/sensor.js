//Sensor Count
var numberOfSensors = 0 ;

//Redirect to Sensor Information
function exploreSensor(sensor_id)
{
	//Set Sensor ID in Session
	sessionStorage.setItem("sensor_id",sensor_id);
	
	//Redirect to Dashboard
	window.location.href = "sensorInfo.html";
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
		},
		lowest: {
			rules: [
			{
				type   : 'number',
				prompt : 'Please enter a valid number, no characters allowed'
			}]
		},
		highest: {
			rules: [
			{
				type   : 'number',
				prompt : 'Please enter a valid number, no characters allowed'
			}]
		}
	}
});

// Create Sensor Form
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

		//Check if Lowest is less than Highest
		if(((formDataJSON.lowest != '') || (formDataJSON.highest != '')) && (parseFloat(formDataJSON.lowest) >= parseFloat(formDataJSON.highest)))
		{
			Snackbar.show({
				text: 'Lowest Limit must be greater than Highest Limit',
				pos: 'bottom-center',
				actionTextColor: 'rgba(255,90,100,1)'
			});
		}
		else
		{
			console.log(formData);
			$.ajax({
				type: 'POST',
				url: apiUrl + '/subsystems/sensor',
				dataType: 'json',
				data: formData,
				contentType: "application/json; charset=utf-8",
				beforeSend: function (xhr)
				{
					xhr.setRequestHeader('x-access-token', token); 
				},
				success: function (response)
				{
					if (numberOfSensors > 0)
					{
						//Add Row in Sensor List
						$('.sensorList').append(`
							<tr class="sensorInfo" onclick="exploreSensor('`+ response.private_id +`')" style="cursor: pointer;">
								<td>`+ formDataJSON.name +`</td>
								<td>`+ formDataJSON.description +`</td>
								<td class="hideOnMobile">`+ response.private_id +`</td>
								<td class="hideOnMobile"></td>
							</tr>
						`);
					}
					else
					{
						//Add Row in Sensor List
						$('.sensorList').html(`
							<tr class="sensorInfo" onclick="exploreSensor('`+ response.private_id +`')" style="cursor: pointer;">
								<td>`+ formDataJSON.name +`</td>
								<td>`+ formDataJSON.description +`</td>
								<td class="hideOnMobile">`+ response.private_id +`</td>
								<td class="hideOnMobile"></td>
							</tr>
						`);
					}

					//Increase Sensor Count
					numberOfSensors++ ;

					//Reset Form
					$('.content.ui.form.createForm').form('reset');

					//Show Snackbar
					Snackbar.show({
						text: 'Sensor Added Successfully',
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
	}
});


// Populate Sensor List
$.ajax({
	type: 'GET',
	url: apiUrl + '/subsystems/sensor',
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
			//Check if a sensor exists
			if (response.exists == true)
			{
				$.each(response.sensors,function(key,sensor)
				{
					$('.sensorList').append(`
						<tr class="sensorInfo" onclick="exploreSensor('`+ sensor.private_id +`')" style="cursor: pointer;">
							<td>`+ sensor.name +`</td>
							<td>`+ sensor.description +`</td>
							<td class="hideOnMobile">`+ sensor.private_id +`</td>
							<td class="hideOnMobile">`+ sensor.node_id +`</td>
						</tr>
					`);
					
					//Increase Sensor Count
					numberOfSensors++ ;
				});
			}
			else
			{
				$('.sensorList').append(`
					<tr>
						<td colspan="4" style="text-align: center;">Looks like you don\'t have a sensor added yet</td>
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