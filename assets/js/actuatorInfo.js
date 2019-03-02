// Get Actuator ID
var actuator_id = sessionStorage.getItem("actuator_id");
var currentState = '' ;
var currentStateColor = '' ;
var remoteButton = '' ;

function triggerChange()
{
	if(currentState == 'Off')
	{
		var newState = '1' ;
	}
	else
	{
		var newState = '0' ;
	}
	// Payload
	stateChangePayload = {} ;
	stateChangePayload['actuator_id'] = actuator_id;
	stateChangePayload['value'] = newState;

	// Send Action Request
	$.ajax({
		type: 'POST',
		url: apiUrl + '/subsystems/action',
		dataType: 'json',
		data: JSON.stringify(stateChangePayload),
		contentType: "application/json; charset=utf-8",
		beforeSend: function (xhr)
		{
			xhr.setRequestHeader('x-access-token', token); 
		},
		success: function (response)
		{
			if (response.action == true)
			{
				//Update Status
				$('#statusUpdate').html('Awaiting actuator to pick up new state');

				//Disable Switch
				$('#remoteButton').html('<h4>Awaiting Change</h4>');

				//Display Snackbar
				Snackbar.show({
					text: 'Action sent to the server, check status for updates',
					pos: 'bottom-center'
				}); 
			}
		},
		error: function (response)
		{
			
		}
	});
}


// Populate Data in Page
function populateData(response)
{
	if(response.actuator_info.state == true)
	{
		currentState = 'On' ;
		currentStateColor = 'rgba(0, 192, 90, 1)' ;
		remoteButton = '<div class="ui button basic red">Switch Off</div>' ;
	}
	else
	{
		currentState = 'Off' ;
		currentStateColor = 'rgba(255,90,100,1)' ;
		remoteButton = '<div class="ui button basic green">Switch On</div>' ;
	}

	//Update Actuator Information Card
	$('#actuatorName').html(response.actuator_info.name);
	$('#actuatorDescription').append(response.actuator_info.description);
	$('#actuatorID').append(response.actuator_info.private_id);
	$('#nodeID').append(response.actuator_info.node_id);
	$('.currentState').html('<i class="power off icon"></i>' + currentState);
	$('#leftCard').css('background-color',currentStateColor);
	$('#remoteButton').html(remoteButton);

	$.each(response.actuator_log,function(key,log)
	{
		dateTime = log.date;
		dateTime = dateTime.split(' ').slice(1, 5).join(' ');

		$('#lastChange').html(dateTime);

		//Populate Reading Table
		$('#readingTableBody').append(`
			<tr>
				<td>`+ log.date +`</td>
				<td>`+ log.value +`</td>
				<td>`+ log.agent +`</td>
				<td>`+ log.cause +`</td>
			</tr>
		`);
	});

	//Declare Data Table
	$('#readingTable').DataTable();

	//Populate Gateway Details
	$('#payloadURL').html(apiUrl + '/gateway/payload');
	$('#getURL').html(apiUrl + '/gateway/instruction/<strong><span style="color: red;">NODE-ID</span></strong>/'+ actuator_id +'/<strong><span style="color: red;">VALUE</span></strong>');
	$('#actuatorIdPayload').html(actuator_id);

}

// Fetch Actuator Info
$.ajax({
	type: 'GET',
	url: apiUrl + '/subsystems/actuator/' + actuator_id,
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
			populateData(response);
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


//Fetch current state after fixed interval
$(document).ready(function() {
	setInterval(function()
	{ 
		$.ajax({
			type: 'GET',
			url: apiUrl + '/subsystems/refresh/actuator/' + actuator_id,
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
					//Update Actuator Cards
					if(response.value == true)
					{
						currentState = 'On' ;
						currentStateColor = 'rgba(0, 192, 90, 1)' ;
						remoteButton = '<div class="ui button basic red">Switch Off</div>' ;
					}
					else
					{
						currentState = 'Off' ;
						currentStateColor = 'rgba(255,90,100,1)' ;
						remoteButton = '<div class="ui button basic green">Switch On</div>' ;
					}
					$('.currentState').html('<i class="power off icon"></i>' + currentState);
					$('#leftCard').css('background-color',currentStateColor);
					$('#remoteButton').html(remoteButton);
				}
			},
			error: function (response)
			{

			}
		});
	}, 5000);
});