// Get Sensor ID
var sensor_id = sessionStorage.getItem("sensor_id");

// Local Variables
var lineChart ;
var dailyChart ;
var lastRecord = 0 ;
var max = null ;
var min = null ;
var sensorName ;
var numberOfPlots=0 ;

function exportCSV()
{
	//Display Snackbar
	Snackbar.show({
		text: 'This feature will be available soon',
		pos: 'bottom-center'
	}); 
}

function manageSensor()
{
	$('.mini.modal.modifyForm').modal('show').modal('setting', 'closable', false) ;
}

$('#modifyForm').on('submit', function(e)
{
	//Prevent Default Action 
	e.preventDefault();

	//Serialize Form Data
	var form = $(this);
	var formData = form.serializeArray() ;
	formData = _.object(_.pluck(formData, 'name'), _.pluck(formData, 'value'));
	formDataJSON = formData ;
	formData = JSON.stringify(formData);

	//Form Validation
	if(formDataJSON.name != '')
	{
		if( parseFloat(formDataJSON.lowest) < parseFloat(formDataJSON.highest) )
		{
			$.ajax({
				type: 'PUT',
				url: apiUrl + '/subsystems/sensor/' + sensor_id,
				data: formData,
				dataType: 'json',
				contentType: "application/json; charset=utf-8",
				beforeSend: function (xhr)
				{
					xhr.setRequestHeader('x-access-token', token); 
				},
				success: function (response)
				{
					if (response.action == true)
					{
						//Update Sensor Information Card
						$('#sensorName').html(formDataJSON.name);
						$('#sensorDescription').html('<strong>Description: </strong>' + formDataJSON.description);
						$('#lowestLim').html('<strong>Lowest Limit: </strong>' + formDataJSON.lowest);
						$('#highestLim').html('<strong>Highest Limit: </strong>' + formDataJSON.highest);

						//Update Sensor Name
						sensorName = formDataJSON.name ;

						//Hide Modal
						$('.mini.modal.modifyForm').modal('hide') ;

						//Display Snackbar
						Snackbar.show({
							text: 'Sensor Information Updated Successfully',
							pos: 'bottom-center'
						}); 
					}
				},
				error: function (response)
				{
					message = 'Something went wrong, please try again later';
					if (response.message)
					{
						message = response.message ;
					}
					Snackbar.show({
						text: message,
						pos: 'bottom-center',
						actionTextColor: 'rgba(255,90,100,1)'
					}); 
				}
			});
		}
		else
		{
			Snackbar.show({
				text: 'Lowest Limit must be greater than Highest Limit',
				pos: 'bottom-center',
				actionTextColor: 'rgba(255,90,100,1)'
			});
		}
	}
	else
	{
		Snackbar.show({
			text: 'Sensor name cannot be blank',
			pos: 'bottom-center',
			actionTextColor: 'rgba(255,90,100,1)'
		});
	}
});

//Enable Delete Button on Correct Sensor Name
document.getElementById("submitDelete").disabled = true;
$('#deleteConfirm').on("input", function(){
	if(this.value == sensorName)
	{
		document.getElementById("submitDelete").disabled = false;
	}
	else
	{
		document.getElementById("submitDelete").disabled = true;
	}
});

function deleteSensor()
{
	$('.mini.modal.deleteForm').modal('show').modal('setting', 'closable', false) ;
}

$('#deleteForm').on('submit', function(e)
{
	//Prevent Default Action 
	e.preventDefault();

	$.ajax({
		type: 'DELETE',
		url: apiUrl + '/subsystems/sensor/' + sensor_id,
		data: {},
		dataType: 'json',
		contentType: "application/json; charset=utf-8",
		beforeSend: function (xhr)
		{
			xhr.setRequestHeader('x-access-token', token); 
		},
		success: function (response)
		{
			//Reditect to Sensor Page
			window.location.href = "sensor.html";
		},
		error: function (response)
		{
			message = 'Something went wrong, please try again later';
			if (response.message)
			{
				message = response.message ;
			}
			Snackbar.show({
				text: message,
				pos: 'bottom-center',
				actionTextColor: 'rgba(255,90,100,1)'
			}); 
		}
	});
});

//Optimize ChartJS for Mobile Devices
var options = [];
if(deviceWidth<768)
{
	options = {
		scales: {
			yAxes: [{
				ticks: {
					beginAtZero: false,
					display: false
				}
			}],
			xAxes: [{
				ticks: {
					display: false
				},
				scaleLabel: {
					display: true,
					labelString: 'Timeline'
				}
			}]
		},
		legend: {
			display: false
		}
	};
}
else
{
	options = {
		scales: {
			yAxes: [{
				ticks: {
					beginAtZero: false
				},
				scaleLabel: {
					display: true,
					labelString: 'Readings'
				}
			}],
			xAxes: [{
				ticks: {
					display: true
				},
				scaleLabel: {
					display: true,
					labelString: 'Timeline'
				}
			}]
		},
		legend: {
			display: false
		}
	};
}

function updateChart(date, value)
{
	//Push Data
	lineChart.data.labels.push(date);
	lineChart.data.datasets.forEach((dataset) => {
		dataset.data.push(value);
	});
	numberOfPlots++ ;

	if (numberOfPlots>5)
	{
		//Pop the first plot
		lineChart.data.labels.splice(0,1);
		lineChart.data.datasets.forEach((dataset) => {
			dataset.data.splice(0,1);
		});
	}

	//Update Chart
	lineChart.update();

	if (value > max)
	{
		max = value ;
		$('.recordHighValue').html('<i class="fire icon"></i>');
		$('.recordHighValue').append(max);
	}
	if (value < min)
	{
		min = value ;
		$('.recordLowValue').html('<i class="snowflake outline icon"></i>');
		$('.recordLowValue').append(min);
	}

	//Push new data into Data Table
	var readingTable = $('#readingTable').DataTable();
	readingTable.row.add([
		date,
		value
	]).draw(false);
}

// Populate Data in Page
function populateData(response)
{

	//Parse Recent Readings from JSON Response
	var data = [];
	var labels = [];
	var dayList = [];
	$.each(response.data,function(key,reading)
	{
		dateTime = reading.date ;
		
		//Get days of the week
		dayList.push({
			day: (dateTime.split(',').slice(0, 1).join('')),
			value: reading.value
		});
		
		//Trim days of the week
		dateTime = dateTime.split(' ').slice(1, 5).join(' ');
		
		//Prepare Labels and Data for Line Chart
		labels.push(dateTime);
		data.push(parseFloat(reading.value));

		//Store the Last Record ID
		lastRecord = reading.record_id;

		//Populate Reading Table
		$('#readingTableBody').append(`
			<tr>
				<td>`+ reading.date +`</td>
				<td>`+ reading.value +`</td>
			</tr>
		`);

	});

	//Declare Data Table
	$('#readingTable').DataTable();

	//Update Sensor Information Card
	$('#sensorName').html(response.sensor_info.name);
	$('#sensorDescription').append(response.sensor_info.description);
	$('#sensorID').append(response.sensor_info.private_id);
	$('#nodeID').append(response.sensor_info.node_id);
	$('#lowestLim').append(response.sensor_info.lowest);
	$('#highestLim').append(response.sensor_info.highest);

	//Update Sensor Name
	sensorName = response.sensor_info.name ;

	//Populate Gateway Details
	$('#payloadURL').html(apiUrl + '/gateway/payload');
	$('#getURL').html(apiUrl + '/gateway/transmit/<strong><span style="color: red;">NODE-ID</span></strong>?sensor_id='+ sensor_id +'&value=<strong><span style="color: red;">VALUE</span></strong>');
	$('#sensorId').html(sensor_id);

	//Update Manage Sensor Form
	$('#modifyName').val(response.sensor_info.name);
	$('#modifyDescription').val(response.sensor_info.description);
	$('#modifyLowest').val(response.sensor_info.lowest);
	$('#modifyHighest').val(response.sensor_info.highest);

	//Update Low and High Reading Card
	min = _.min(data);
	max = _.max(data);
	$('.recordLowValue').append(min);
	$('.recordHighValue').append(max);

	//Get Number of Optimum Readings
	lowest = parseFloat(response.sensor_info.lowest) ;
	highest = parseFloat(response.sensor_info.highest) ;
	if(lowest && highest)
	{
		lowValues = _.filter(data, function(num){
			if(num <= lowest)
				return num ;
		});
		highValues = _.filter(data, function(num){
			if(num >= highest)
				return num ;
		});
		optimumValues = _.filter(data, function(num){
			if((num > lowest) && (num < highest))
				return num ;
		});

		var ctx = $("#optimalChart");
		doughnutChart = new Chart(ctx, {
			type: 'doughnut',
			data: {
				datasets: [{
					data: [
						_.size(optimumValues),
						_.size(lowValues),
						_.size(highValues)
					],
					backgroundColor: [
						'rgba(0, 192, 90, 0.2)',
						'rgba(54, 100, 235, 0.2)',
						'rgba(255,99,132,0.2)'
					],
					borderColor: [
						'rgba(0, 192, 90, 1)',
						'rgba(54, 100, 235, 1)',
						'rgba(255,99,132,1)'
					]
				}],
				labels: [
					'Optimal',
					'Low',
					'High'
				]
			},
			options: {
				responsive: true,
				hover: {
					mode: 'nearest',
					intersect: true
				},
				legend: {
					display: false,
					position: "bottom"
				}
			}
		});

	}
	else
	{
		$('.optimalityCard').html('<h4 style="text-align: center; color: grey; letter-spacing: 1px;">Set lowest and highest limits to activate this chart</h4>')
	}

	//Plot Live Chart with last 5 readings
	data = _.last(data, [5]) ;
	labels = _.last(labels, [5]) ;
	var ctx = $("#liveChart");
	lineChart = new Chart(ctx, {
		type: 'line',
		data: {
			labels: labels,
			datasets: [{
				label: 'Reading Value',
				data: data,
				fill: false,
				borderColor: 'rgba(153, 102, 255, 0.7)',
				pointRadius: 7
			}]
		},
		options: options
	});
	numberOfPlots = _.size(labels);

	//Daily Insight Variables
	counts = _.countBy(dayList, 'day');
	dayList = _.groupBy(dayList, 'day');

	//Plot Daily Insight
	ctx = $("#weekChart");
	dailyChart = new Chart(ctx, {
		type: 'bar',
		data: {
			labels: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
			datasets: [{
				label: 'Average',
				data: [
					_.reduce((_.pluck(dayList.Sun, 'value')), function(sum, num){ return sum + parseFloat(num) ; }, 0) / counts.Sun,
					_.reduce((_.pluck(dayList.Mon, 'value')), function(sum, num){ return sum + parseFloat(num) ; }, 0) / counts.Mon,
					_.reduce((_.pluck(dayList.Tue, 'value')), function(sum, num){ return sum + parseFloat(num) ; }, 0) / counts.Tue,
					_.reduce((_.pluck(dayList.Wed, 'value')), function(sum, num){ return sum + parseFloat(num) ; }, 0) / counts.Wed,
					_.reduce((_.pluck(dayList.Thu, 'value')), function(sum, num){ return sum + parseFloat(num) ; }, 0) / counts.Thu,
					_.reduce((_.pluck(dayList.Fri, 'value')), function(sum, num){ return sum + parseFloat(num) ; }, 0) / counts.Fri,
					_.reduce((_.pluck(dayList.Sat, 'value')), function(sum, num){ return sum + parseFloat(num) ; }, 0) / counts.Sat
				],
				backgroundColor: [
					'rgba(255, 99, 132, 0.2)',
					'rgba(54, 162, 235, 0.2)',
					'rgba(255, 206, 86, 0.2)',
					'rgba(75, 192, 192, 0.2)',
					'rgba(153, 102, 255, 0.2)',
					'rgba(255, 159, 64, 0.2)',
					'rgba(255, 99, 102, 0.2)'
				],
				borderColor: [
					'rgba(255,99,132,1)',
					'rgba(54, 162, 235, 1)',
					'rgba(255, 206, 86, 1)',
					'rgba(75, 192, 192, 1)',
					'rgba(153, 102, 255, 1)',
					'rgba(255, 159, 64, 1)',
					'rgba(255,99,102,1)'
				],
				borderWidth: 1
			}]
		},
		options: {
			legend: {
				display: false
			},
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true
					}
				}]
			},
		}
	});
}

// Fetch Sensor Info
$.ajax({
	type: 'GET',
	url: apiUrl + '/subsystems/sensor/' + sensor_id,
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

//Fetch last reading after fixed interval
$(document).ready(function() {
	setInterval(function()
	{ 
		$.ajax({
			type: 'GET',
			url: apiUrl + '/gateway/last/' + sensor_id,
			dataType: 'json',
			data: '{}',
			success: function (response)
			{
				//Check for action success
				if (response.action == true)
				{
					if (response.record_id != lastRecord)
					{
						lastRecord = response.record_id;
						updateChart(response.date, parseFloat(response.value));
					}
				}
			},
			error: function (response)
			{

			}
		});
	}, 5000);
});