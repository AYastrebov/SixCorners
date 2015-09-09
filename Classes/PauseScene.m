//
//  PauseScene.m
//  6Corners
//
//  Created by Andrey Yastrebov on 3/1/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import "PauseScene.h"
#import "MenuScene.h"
#import "GameField.h"
#import "SkinsManager.h"

@implementation PauseScene

+ (id) scene
{
	// 'scene' is an autorelease object.
	CCScene *scene = [CCScene node];
	
	// 'layer' is an autorelease object.
	PauseScene *layer = [PauseScene node];
	
	// add layer as a child to scene
	[scene addChild: layer];
	// return the scene
	return scene;
}

- (id)initWithGameScene:(GameField *)gameField
{
	if ((self = [super init])) 
	{
		menuButtonsPath = [SkinsManager menuButtonsPath];
		gameFieldPath = [SkinsManager gameFieldPath];
		
		currentGame = [gameField retain];
		
		CCSprite *bg = [CCSprite spriteWithFile:[NSString stringWithFormat:@"%@/%@", gameFieldPath, @"pausemenu.png"]];
		
		CCMenuItem *menuItem1 = [CCMenuItemImage itemFromNormalImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"resume.png"] 
													   selectedImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"resume2.png"] 
															  target:self 
															selector:@selector(resume:)];
		
		CCMenuItem *menuItem2 = [CCMenuItemImage itemFromNormalImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"retry.png"] 
													   selectedImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"retry2.png"] 
															  target:self 
															selector:@selector(retry:)];
		
		CCMenuItem *menuItem3 = [CCMenuItemImage itemFromNormalImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"menu.png"] 
													   selectedImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"menu2.png"] 
															  target:self 
															selector:@selector(menu:)];
		
		CCMenu *pauseMenu = [CCMenu menuWithItems:menuItem1, menuItem2, menuItem3, nil];
		[pauseMenu alignItemsVerticallyWithPadding:15];
		pauseMenu.position = ccp(0, -20);
		
		[self addChild:bg z:0];
		[self addChild:pauseMenu z:1];
	}
	return self;
}

- (void)resume:(id)sender
{
	[currentGame resumeGame];
	[currentGame.pauseButton setIsEnabled:YES];
}

- (void)retry:(id)sender
{
	[[CCDirector sharedDirector] resume];
	GameField *gameField = [GameField node];
	if (!currentGame.isEndlessMode) 
	{
		[gameField setLevel:currentGame.level-1 speed:0];
	}
	else 
	{
		[gameField setLevel:currentGame.level-1 speed:currentGame.endlessModeSpeed];
	}

	[[CCDirector sharedDirector] replaceScene:[CCTransitionShrinkGrow transitionWithDuration:.5f scene:(CCScene *)gameField]];
}

- (void)menu:(id)sender
{
	[[CCDirector sharedDirector] resume];
	[[CCDirector sharedDirector] replaceScene:[CCTransitionShrinkGrow transitionWithDuration:.5f scene:[MenuScene node]]];
}

- (void)dealloc
{
	[currentGame release];
	[super dealloc];
}

@end
