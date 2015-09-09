//
//  _CornersAppDelegate.m
//  6Corners
//
//  Created by Andrey Yastrebov on 2/8/11.
//  Copyright __MyCompanyName__ 2011. All rights reserved.
//

#import "cocos2d.h"

#import "_CornersAppDelegate.h"
#import "GameConfig.h"
#import "MenuScene.h"
#import "RootViewController.h"
#import "SimpleAudioEngine.h"
#import "Appirater.h"

NSString* const kStartUpFile = @"startUpFile.txt";
@implementation _CornersAppDelegate

BOOL _isMute;
float _musicVolume;
NSUInteger _skin;
NSUInteger _preferedSpeed;

@synthesize window, viewController;

- (NSString *)dataFilePath 
{ 
	NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES); 
	NSString *documentsDirectory = [paths objectAtIndex:0]; 
	return [documentsDirectory stringByAppendingPathComponent:kStartUpFile]; 
}

- (void)readSettings
{
	NSString *filePath = [self dataFilePath];
	
	if (![[NSFileManager defaultManager] fileExistsAtPath:filePath]) 
	{ 
		_isMute = NO;
		_musicVolume = .5f;
		_skin = 0;
		_preferedSpeed = 0;
	}
	else 
	{
		NSArray *fileArray = [NSArray arrayWithContentsOfFile:filePath];
		
		if ([fileArray count] < 4)
		{
			_isMute = NO;
			_musicVolume = .5f;
			_skin = 0;
			_preferedSpeed = 0;
		}
		else
		{
			_isMute = [[fileArray objectAtIndex:0] boolValue];
			_musicVolume = [[fileArray objectAtIndex:1] floatValue];
			_skin = [[fileArray objectAtIndex:2] integerValue];
			_preferedSpeed = [[fileArray objectAtIndex:3] integerValue];
		}
	}

}

- (void)saveSettings
{
	NSMutableArray *fileArray = [[NSMutableArray alloc] init];
	
	[fileArray addObject:[NSNumber numberWithBool:_isMute]];
	[fileArray addObject:[NSNumber numberWithFloat:_musicVolume]];
	[fileArray addObject:[NSNumber numberWithInteger:_skin]];
	[fileArray addObject:[NSNumber numberWithInteger:_preferedSpeed]];
	
	[fileArray writeToFile:[self dataFilePath] atomically:YES];

	[fileArray release];
}

+ (BOOL) isMute
{
	return _isMute;
}

+ (float) musicVolume
{
	return _musicVolume;
}

+ (NSUInteger)selectedSkin
{
	return _skin;
}

+ (NSUInteger)preferdSpeed
{
	return _preferedSpeed;
}

+ (void) setMusicVolume:(float) musicV
{
	_musicVolume = musicV;
}

+ (void) setIsMute:(BOOL) isM
{
	_isMute = isM;
}	

+ (void)setSkin:(NSUInteger)skin
{
	_skin = skin;
}

+ (void)setPreferdSpeed:(NSUInteger)preferedSpeed
{
	_preferedSpeed = preferedSpeed;
}

+ (NSArray *)sounds
{
	NSArray *soundFX = [NSArray arrayWithObjects:
						@"Goof.mp3",
						@"ForeignerJourney.mp3", 
						@"Tanzmusik.mp3", 
						@"TributetoKyoheiSada.mp3", 
						@"Downstairs.mp3",
						nil];
	return soundFX;
}

- (void) removeStartupFlicker
{
	//
	// THIS CODE REMOVES THE STARTUP FLICKER
	//
	// Uncomment the following code if you Application only supports landscape mode
	//
#if GAME_AUTOROTATION == kGameAutorotationUIViewController

//	CC_ENABLE_DEFAULT_GL_STATES();
//	CCDirector *director = [CCDirector sharedDirector];
//	CGSize size = [director winSize];
//	CCSprite *sprite = [CCSprite spriteWithFile:@"Default.png"];
//	sprite.position = ccp(size.width/2, size.height/2);
//	sprite.rotation = -90;
//	[sprite visit];
//	[[director openGLView] swapBuffers];
//	CC_ENABLE_DEFAULT_GL_STATES();
	
#endif // GAME_AUTOROTATION == kGameAutorotationUIViewController	
}

- (void)performApplicationStartupLogic
{
	// Init the window
	window = [[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
	
	// Try to use CADisplayLink director
	// if it fails (SDK < 3.1) use the default director
	if( ! [CCDirector setDirectorType:kCCDirectorTypeDisplayLink] )
		[CCDirector setDirectorType:kCCDirectorTypeDefault];
	
	
	CCDirector *director = [CCDirector sharedDirector];
	
	[self readSettings];
	
	// Init the View Controller
	viewController = [[RootViewController alloc] initWithNibName:nil bundle:nil];
	viewController.wantsFullScreenLayout = YES;
	
	//
	// Create the EAGLView manually
	//  1. Create a RGB565 format. Alternative: RGBA8
	//	2. depth format of 0 bit. Use 16 or 24 bit for 3d effects, like CCPageTurnTransition
	//
	//
	EAGLView *glView = [EAGLView viewWithFrame:[window bounds]
								   pixelFormat:kEAGLColorFormatRGB565	// kEAGLColorFormatRGBA8
								   depthFormat:0						// GL_DEPTH_COMPONENT16_OES
						];
	
	// attach the openglView to the director
	[director setOpenGLView:glView];
	
	// Enables High Res mode (Retina Display) on iPhone 4 and maintains low res on all other devices
	if( ! [director enableRetinaDisplay:YES] )
		CCLOG(@"Retina Display Not supported");
	
	//
	// VERY IMPORTANT:
	// If the rotation is going to be controlled by a UIViewController
	// then the device orientation should be "Portrait".
	//
	// IMPORTANT:
	// By default, this template only supports Landscape orientations.
	// Edit the RootViewController.m file to edit the supported orientations.
	//
#if GAME_AUTOROTATION == kGameAutorotationUIViewController
	[director setDeviceOrientation:kCCDeviceOrientationPortrait];
#else
	[director setDeviceOrientation:kCCDeviceOrientationLandscapeLeft];
#endif
	
	[director setAnimationInterval:1.0/60];
	[director setDisplayFPS:NO];
	
	
	// make the OpenGLView a child of the view controller
	[viewController setView:glView];
	
	// make the View Controller a child of the main window
	//[window addSubview: viewController.view];
	[self.window setRootViewController:viewController];
	[window makeKeyAndVisible];
	
	// Default texture format for PNG/BMP/TIFF/JPEG/GIF images
	// It can be RGBA8888, RGBA4444, RGB5_A1, RGB565
	// You can change anytime.
	[CCTexture2D setDefaultAlphaPixelFormat:kCCTexture2DPixelFormat_RGBA8888];
	
	
	NSArray *soundFX = [_CornersAppDelegate sounds];
	
	//Get a pointer to the sound engine 
	SimpleAudioEngine *sae = [SimpleAudioEngine sharedEngine];
	[[CDAudioManager sharedManager] setResignBehavior:kAMRBStopPlay autoHandle:YES];
	
	//Test preloading two of our files, this will have no performance effect. In reality you would
	//probably do this during start up
	[sae preloadBackgroundMusic:[soundFX objectAtIndex:0]];
	[sae preloadBackgroundMusic:[soundFX objectAtIndex:1]];
	[sae preloadBackgroundMusic:[soundFX objectAtIndex:2]];
	[sae preloadBackgroundMusic:[soundFX objectAtIndex:3]];
	[sae preloadBackgroundMusic:[soundFX objectAtIndex:4]];
	
	// Removes the startup flicker
	[self removeStartupFlicker];
	
	
	//Game Center
	if ([self isGameCenterAvailable]) 
	{
		[self authenticateLocalPlayer];	
	}
	
	// Run the intro Scene
	[[CCDirector sharedDirector] runWithScene: [MenuScene scene]];		
}

- (void) applicationDidFinishLaunching:(UIApplication*)application
{
	[self performApplicationStartupLogic];
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
	[self performApplicationStartupLogic];
	[Appirater appLaunched:YES];
	return YES;
}

- (BOOL) isGameCenterAvailable
{
    // Check for presence of GKLocalPlayer API.
    Class gcClass = (NSClassFromString(@"GKLocalPlayer"));
	
    // The device must be running running iOS 4.1 or later.
    NSString *reqSysVer = @"4.1";
    NSString *currSysVer = [[UIDevice currentDevice] systemVersion];
    BOOL osVersionSupported = ([currSysVer compare:reqSysVer options:NSNumericSearch] != NSOrderedAscending);
	
    return (gcClass && osVersionSupported);
}

- (void) authenticateLocalPlayer
{
    [[GKLocalPlayer localPlayer] authenticateWithCompletionHandler:^(NSError *error) {
		if (error == nil)
		{
			// Insert code here to handle a successful authentication.
			NSLog(@"Game Center: Ima POLZOVATELA ili PAROL PRAVELNIE");
		}
		else
		{
			// Your application can process the error parameter to report the error to the player.
			NSLog(@"Game Center: Ima POLZOVATELA ili PAROL ne PRAVELNIE");
		}
	}];
}

- (void)showGameCenterLeaderboard
{
	GKLeaderboardViewController *leaderboardController = [[GKLeaderboardViewController alloc] init];
    if (leaderboardController != nil)
    {
        leaderboardController.leaderboardDelegate = viewController;
        [viewController presentModalViewController: leaderboardController animated: YES];
    }
}

- (void)showGameCenterAchivements
{
	GKAchievementViewController *achivementController = [[GKAchievementViewController alloc] init];
	if (achivementController != nil)
    {
        achivementController.achievementDelegate = viewController;
        [viewController presentModalViewController: achivementController animated: YES];
    }
}

- (void)applicationWillResignActive:(UIApplication *)application 
{
	[[CCDirector sharedDirector] pause];
}

- (void)applicationDidBecomeActive:(UIApplication *)application 
{
	[[CCDirector sharedDirector] resume];
}

- (void)applicationDidReceiveMemoryWarning:(UIApplication *)application 
{
	[[CCDirector sharedDirector] purgeCachedData];
}

-(void) applicationDidEnterBackground:(UIApplication*)application 
{
	[[CCDirector sharedDirector] stopAnimation];
	[self saveSettings];
}

-(void) applicationWillEnterForeground:(UIApplication*)application 
{
	[[CCDirector sharedDirector] startAnimation];
	[Appirater appEnteredForeground:YES];
}

- (void)applicationWillTerminate:(UIApplication *)application 
{
	[self saveSettings];
	
	CCDirector *director = [CCDirector sharedDirector];
	
	[[director openGLView] removeFromSuperview];
	
	[viewController release];
	
	[window release];
		
	[director end];	
}

- (void)applicationSignificantTimeChange:(UIApplication *)application 
{
	[[CCDirector sharedDirector] setNextDeltaTimeZero:YES];
	[Appirater userDidSignificantEvent:YES];
}

- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{}

- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
{
}

- (void)dealloc 
{
	[[CCDirector sharedDirector] release];
	[window release];
	[super dealloc];
}

@end
