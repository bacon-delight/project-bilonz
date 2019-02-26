//Check if token exists
if (!token)
{
	//Clear any existing variables from Session
	sessionStorage.clear();

	//Reditect to Landing Page
	window.location.href = "index.html";
}

//Process Logout
function logout()
{
	//Clear Token from Session
	sessionStorage.clear();

	//Reditect to Landing Page
	window.location.href = "index.html";
}

//Generate Sitebar Navigation
var sidebarNavigation = `
	<a href="dashboard.html" class="item">Dashboard</a>
	<a href="node.html" class="item">Nodes</a>
	<a href="sensor.html" class="item">Sensors</a>
	<a href="actuator.html" class="item">Actuators</a>
	<div class="item">
		<div class="header">Community & Support</div>
		<div class="menu">
			<a href="" class="item">Community</a>
			<a href="" class="item">Documentation</a>
			<a href="" class="item">Examples</a>
		</div>
	</div>
	<div class="item">
		<div class="header">Manage</div>
		<div class="menu">
			<a href="" class="item">Usage</a>
			<a href="" class="item">Billing</a>
			<a href="" class="item">Plans</a>
		</div>
	</div>
	<div class="item">
		<div class="header">Account Settings</div>
		<div class="menu">
			<a href="profile.html" class="item">Profile</a>
			<a href="" class="item">Privacy</a>
			<a onclick="logout()" class="item">Logout</a>
		</div>
	</div>
`;
$('#sidebarMenu').html(sidebarNavigation);


//Toggle Sidebar
var deviceWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width ;
var mobileWidth = 767 ;
var sidebarOpen = 0 ;
function setSidebar()
{
	deviceWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width ;
	if (deviceWidth > mobileWidth)
	{
		sidebarOpen = 1 ;
		$('.sidebarContainer').css('display', 'block');
		$('.contentContainer').css('width', deviceWidth-250);
	}
	else
	{
		sidebarOpen = 0 ;
		$('.sidebarContainer').css('display', 'none');
		$('.contentContainer').css('width', deviceWidth);
	}
}

//Toggle Sidebar Open/Close
function toggleSidebar()
{
	if (sidebarOpen == 0)
	{
		sidebarOpen = 1 ;
		$('.sidebarContainer').css('display', 'block');
		if (deviceWidth > mobileWidth)
		{
			$('.contentContainer').css('width', deviceWidth-250);
		}
	}
	else
	{
		sidebarOpen = 0 ;
		$('.sidebarContainer').css('display', 'none');
		if (deviceWidth > mobileWidth)
		{
			$('.contentContainer').css('width', deviceWidth);
		}
	}
}

//Set Initial Sidebar Position
setSidebar();

//Adapt Sidebar on Window Resize
$( window ).resize(function() {
	setSidebar();
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