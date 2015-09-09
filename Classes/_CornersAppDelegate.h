//
//  _CornersAppDelegate.h
//  6Corners
//
//  Created by Andrey Yastrebov on 2/8/11.
//  Copyright __MyCompanyName__ 2011. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <GameKit/GameKit.h>


@class RootViewController;
@class MyOFDelegate;

extern NSString* const kStartUpFile;

@interface _CornersAppDelegate : NSObject <UIApplicationDelegate> 
{
	UIWindow			*window;
	RootViewController	*viewController;}

@property (nonatomic, retain) UIWindow *window;
@property (nonatomic, retain) RootViewController	*viewController;

- (void)performApplicationStartupLogic;
+ (NSArray *)sounds;
+ (BOOL) isMute;
+ (float) musicVolume;
+ (NSUInteger)selectedSkin;
+ (NSUInteger)preferdSpeed;
+ (void) setMusicVolume:(float) musicV;
+ (void) setIsMute:(BOOL) isM;
+ (void)setSkin:(NSUInteger)skin;
+ (void)setPreferdSpeed:(NSUInteger)preferedSpeed;
- (NSString *)dataFilePath;
- (void)readSettings;
- (void)saveSettings;
- (void) authenticateLocalPlayer;

- (void)showGameCenterLeaderboard;
- (void)showGameCenterAchivements;
- (void)authenticateLocalPlayer;
- (BOOL)isGameCenterAvailable;

@end
