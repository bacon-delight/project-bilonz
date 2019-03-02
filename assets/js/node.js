//Local Variables
var numberOfNodes = 0 ;

//Redirect to Node Information
function exploreNode(node_id)
{
	//Set Node ID in Session
	sessionStorage.setItem("node_id",node_id);
	
	//Redirect to Dashboard
	window.location.href = "nodeInfo.html";
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
		latitude: {
			rules: [
			{
				type   : 'number',
				prompt : 'Latitude should be a number'
			}]
		},
		longitude: {
			rules: [
			{
				type   : 'number',
				prompt : 'Longitude should be a number'
			}]
		},
		elevation: {
			rules: [
			{
				type   : 'number',
				prompt : 'Elevation should be a number'
			}]
		}
	}
});

// Create Node Form
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

		console.log('valid');

		$.ajax({
			type: 'POST',
			url: apiUrl + '/subsystems/node',
			dataType: 'json',
			data: formData,
			contentType: "application/json; charset=utf-8",
			beforeSend: function (xhr)
			{
				xhr.setRequestHeader('x-access-token', token); 
			},
			success: function (response)
			{
				if(numberOfNodes > 0)
				{
					//Add Row in Node List
					$('.nodeList').append(`
						<tr class="nodeInfo" onclick="exploreNode('`+ response.private_id +`')" style="cursor: pointer;">
							<td>`+ formDataJSON.name +`</td>
							<td>`+ formDataJSON.description +`</td>
							<td class="hideOnMobile">`+ response.location +`</td>
							<td class="hideOnMobile">`+ response.private_id +`</td>
						</tr>
					`);
				}
				else
				{
					//Add Row in Node List
					$('.nodeList').html(`
						<tr class="nodeInfo" onclick="exploreNode('`+ response.private_id +`')" style="cursor: pointer;">
							<td>`+ formDataJSON.name +`</td>
							<td>`+ formDataJSON.description +`</td>
							<td class="hideOnMobile">`+ response.location +`</td>
							<td class="hideOnMobile">`+ response.private_id +`</td>
						</tr>
					`);
				}

				//Increase Count
				numberOfNodes++ ;

				//Reset Form
				$('.content.ui.form.createForm').form('reset');

				//Show Snackbar
				Snackbar.show({
					text: 'Node Added Successfully',
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


// Populate Node List
$.ajax({
	type: 'GET',
	url: apiUrl + '/subsystems/node',
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
			//Check if an node exists
			if (response.exists == true)
			{
				$.each(response.nodes,function(key,node)
				{
					$('.nodeList').append(`
						<tr class="nodeInfo" onclick="exploreNode('`+ node.private_id +`')" style="cursor: pointer;">
							<td>`+ node.name +`</td>
							<td>`+ node.description +`</td>
							<td class="hideOnMobile">`+ node.location +`</td>
							<td class="hideOnMobile">`+ node.private_id +`</td>
						</tr>
					`);
					numberOfNodes++ ;
				});
			}
			else
			{
				$('.nodeList').append(`
					<tr>
						<td colspan="4" style="text-align: center;">Looks like you don\'t have a node added yet</td>
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