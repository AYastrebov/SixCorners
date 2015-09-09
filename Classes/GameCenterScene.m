//
//  GameCenterScene.m
//  6Corners
//
//  Created by Andrey Yastrebov on 3/2/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import "GameCenterScene.h"
#import "MenuScene.h"
#import "_CornersAppDelegate.h"
#import "SkinsManager.h"

@implementation GameCenterScene

+ (id) scene
{
	// 'scene' is an autorelease object.
	CCScene *scene = [CCScene node];
	
	// 'layer' is an autorelease object.
	GameCenterScene *layer = [GameCenterScene node];
	
	// add layer as a child to scene
	[scene addChild: layer];
	// return the scene
	return scene;
}

- (id)initWithMenu:(MenuScene *)menu
{
	if ((self = [super init])) 
	{
		menuPath = [SkinsManager menuPath];
		menuButtonsPath = [SkinsManager menuButtonsPath];
		
		menuScene = [menu retain];
		
		CCSprite *bg = [CCSprite spriteWithFile:[NSString stringWithFormat:@"%@/%@", menuPath, @"gamecenter_bg.png"]];
		
		CCMenuItem *menuItem1 = [CCMenuItemImage itemFromNormalImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"leaderboards.png"] 
													   selectedImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"leaderboards2.png"] 
															  target:self 
															selector:@selector(showLeaderBords:)];
		
		CCMenuItem *menuItem2 = [CCMenuItemImage itemFromNormalImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"achivements.png"] 
													   selectedImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"achivements2.png"] 
															  target:self 
															selector:@selector(showAchivements:)];
		
		CCMenuItem *menuItem3 = [CCMenuItemImage itemFromNormalImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"close.png"] 
													   selectedImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"close2.png"] 
															  target:self 
															selector:@selector(back:)];
		
		CCMenu *pauseMenu = [CCMenu menuWithItems:menuItem1, menuItem2, menuItem3, nil];
		[pauseMenu alignItemsVerticallyWithPadding:20];
		pauseMenu.position = ccp(0, -30);
		
		[self addChild:bg z:0];
		[self addChild:pauseMenu z:1];
	}
	return self;
}

- (void)showLeaderBords:(id)sender
{
	_CornersAppDelegate *delegate = (_CornersAppDelegate *)[[UIApplication sharedApplication] delegate];
	[delegate showGameCenterLeaderboard];
	[menuScene removeChildByTag:1 cleanup:YES];
	[menuScene enableMenuItems];
}

- (void)showAchivements:(id)sender
{
	_CornersAppDelegate *delegate = (_CornersAppDelegate *)[[UIApplication sharedApplication] delegate];
	[delegate showGameCenterAchivements];
	[menuScene removeChildByTag:1 cleanup:YES];
	[menuScene enableMenuItems];
}

- (void)back:(id)sender
{
	[menuScene removeChildByTag:1 cleanup:YES];
	[menuScene enableMenuItems];
}

- (void)dealloc
{
	[menuScene release];
	[super dealloc];
}

@end
