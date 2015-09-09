//
//  LevelsMenu.m
//  6Corners
//
//  Created by Andrey Yastrebov on 2/26/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import "LevelsMenu.h"
#import "GameField.h"
#import "Audio.h"
#import "SkinsManager.h"
#import "SpeedSelector.h"

@implementation LevelsMenu
@synthesize audio;

+ (id) scene
{
	// 'scene' is an autorelease object.
	CCScene *scene = [CCScene node];
	
	// 'layer' is an autorelease object.
	LevelsMenu *layer = [LevelsMenu node];
	
	// add layer as a child to scene
	[scene addChild: layer];
	
	// return the scene
	return scene;
}

- (id) init
{
	if( (self = [super init] ) ) 
	{
		winSize = [[CCDirector sharedDirector] winSize];
		
		menuButtonsPath = [SkinsManager menuButtonsPath];
		gameFieldPath = [SkinsManager gameFieldPath];
		
		CCSprite *background = [CCSprite spriteWithFile:[NSString stringWithFormat:@"%@/%@",gameFieldPath ,@"background.png"]];
		[background setPosition:ccp(winSize.width/2, winSize.height/2)];
		[self addChild:background z:-1];
		
		CCMenuItem *level1item = [CCMenuItemImage itemFromNormalImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"level1.png"] 
												   selectedImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"level1_2.png"] 
														  target:self 
														selector:@selector(levelSelector:)];
		level1item.tag = 1;
		
		CCMenuItem *level2item = [CCMenuItemImage itemFromNormalImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath ,@"level2.png"] 
														selectedImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath ,@"level2_2.png"] 
															   target:self 
															 selector:@selector(levelSelector:)];
		level2item.tag = 2;
		
		CCMenuItem *level3item = [CCMenuItemImage itemFromNormalImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath ,@"level3.png"] 
														selectedImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath ,@"level3_2.png"] 
															   target:self 
															 selector:@selector(levelSelector:)];
		level3item.tag = 3;
		
		CCMenuItem *level4item = [CCMenuItemImage itemFromNormalImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"level4.png"] 
														selectedImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"level4_2.png"] 
															   target:self 
															 selector:@selector(levelSelector:)];
		level4item.tag = 4;
		
		CCMenuItem *level5item = [CCMenuItemImage itemFromNormalImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"level5.png"] 
														selectedImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"level5_2.png"] 
															   target:self 
															 selector:@selector(levelSelector:)];
		level5item.tag = 5;
		
		CCMenuItem *level6item = [CCMenuItemImage itemFromNormalImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"level6.png"] 
														selectedImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"level6_2.png"] 
															   target:self 
															 selector:@selector(levelSelector:)];
		level6item.tag = 6;
		
		CCMenuItem *level7item = [CCMenuItemImage itemFromNormalImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"level7.png"] 
														selectedImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"level7_2.png"] 
															   target:self 
															 selector:@selector(levelSelector:)];
		level7item.tag = 7;
		
		CCMenuItem *level8item = [CCMenuItemImage itemFromNormalImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"level8.png"] 
														selectedImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"level8_2.png"] 
															   target:self 
															 selector:@selector(levelSelector:)];
		level8item.tag = 8;
		
		CCMenuItem *level9item = [CCMenuItemImage itemFromNormalImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"level9.png"] 
														selectedImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"level9_2.png"] 
															   target:self 
															 selector:@selector(levelSelector:)];
		level9item.tag = 9;
		
		CCMenuItem *level10item = [CCMenuItemImage itemFromNormalImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"level10.png"] 
														selectedImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"level10_2.png"] 
															   target:self 
															 selector:@selector(levelSelector:)];
		level10item.tag = 10;
		
		CCMenuItem *endlessitem = [CCMenuItemImage itemFromNormalImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"endless.png"] 
														 selectedImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"endless2.png"] 
																target:self 
															  selector:@selector(endlessMode:)];
		endlessitem.tag = 11;
		
		CCMenuItem *back = [CCMenuItemImage itemFromNormalImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"goback_small.png"] 
												  selectedImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"goback_small2.png"] 
														 target:self 
													   selector:@selector(backCallback:)];
		menuItems = [[NSArray alloc] initWithObjects:
					 back,
					 level1item, 
					 level2item, 
					 level3item, 
					 level4item, 
					 level5item, 
					 level6item, 
					 level7item, 
					 level8item, 
					 level9item,
					 level10item,
					 endlessitem,
					 nil];
		
		CCMenu *levelsMenu = [CCMenu menuWithItems:
							  back,
							  level1item, 
							  level2item, 
							  level3item, 
							  level4item, 
							  level5item, 
							  level6item, 
							  level7item, 
							  level8item, 
							  level9item,
							  level10item,
							  endlessitem,
							  nil];
		[levelsMenu alignItemsVerticallyWithPadding:20];
		[levelsMenu setPosition:CGPointMake(winSize.width/2, -30)];
		
		// set up the scrolling layer
		self.isTouchEnabled = YES;
		isDragging = NO;
		lasty = 0.0f;
		yvel = 0.0f;
		contentHeight = 550; // whatever you want here for total height
		// main scrolling layer
		scrollLayer = [[CCLayer alloc] init];
		scrollLayer.anchorPoint = ccp(160, 240);
		scrollLayer.position = ccp( 0, 0 );
		[scrollLayer addChild:levelsMenu z:-1];
		[self addChild:scrollLayer z:0];
		[self schedule:@selector(moveTick:) interval:0.02f];
	}
	return self;
}

- (void)backCallback:(id)sender
{
	[[CCDirector sharedDirector] popSceneWithTransition:[CCTransitionShrinkGrow class] duration:.5f];
}

- (void)levelSelector:(id)sender
{
	CCMenuItem *menuItem = (CCMenuItem *)sender;
	
	[self.audio stopMusic];
	GameField *gameField = [GameField node];
    NSUInteger level = (menuItem.tag - 1);
	[gameField setLevel:level speed:0];
	[[CCDirector sharedDirector] replaceScene:[CCTransitionShrinkGrow transitionWithDuration:.5f scene:(CCScene *)gameField]];
}

- (void)lockButtons:(BOOL)lock
{
	for (CCMenuItem *item in menuItems) 
	{
		[item setIsEnabled:!lock];
	}
	self.isTouchEnabled = !lock;
}

- (void)endlessMode:(id)sender
{
	[self lockButtons:YES];
	SpeedSelector *speedSelector = [[SpeedSelector alloc] initWithLevelsMenu:self];
	speedSelector.bgAudio = audio;
	speedSelector.tag = 12;
	speedSelector.position = ccp(winSize.width/2, winSize.height/2);
	[self addChild:speedSelector z:1];
}

#pragma mark Scheduled Methods

- (void) moveTick: (ccTime)dt {
	float friction = 0.95f;
	
	if ( !isDragging )
	{
		// inertia
		yvel *= friction;
		CGPoint pos = scrollLayer.position;
		pos.y += yvel;
		
		// *** CHANGE BEHAVIOR HERE *** //
		// to stop at bounds
		pos.y = MAX( 0, pos.y );
		pos.y = MIN( contentHeight + 480, pos.y );
		// to bounce at bounds
		if ( pos.y < 40 ) { yvel *= -1; pos.y = 0; }
		if ( pos.y > contentHeight + 0 ) { yvel *= -1; pos.y = contentHeight + 0; }
		scrollLayer.position = pos;
	}
	else
	{
		yvel = ( scrollLayer.position.y - lasty ) / 2;
		lasty = scrollLayer.position.y;
	}
}

#pragma mark Touch Methods

// other touch events : ccTouchesBegan, ccTouchesMoved, ccTouchesEnded, ccTouchesCancelled
- (void) ccTouchesBegan: (NSSet *)touches withEvent: (UIEvent *)event
{
	isDragging = YES;
	return;
}

- (void) ccTouchesMoved: (NSSet *)touches withEvent: (UIEvent *)event
{
	
	UITouch *touch = [touches anyObject];
	
	// simple position update
	CGPoint a = [[CCDirector sharedDirector] convertToGL:[touch previousLocationInView:touch.view]];
	CGPoint b = [[CCDirector sharedDirector] convertToGL:[touch locationInView:touch.view]];
	CGPoint nowPosition = scrollLayer.position;
	nowPosition.y += ( b.y - a.y );
	nowPosition.y = MAX( 0, nowPosition.y );
	nowPosition.y = MIN( contentHeight + 0, nowPosition.y );
	scrollLayer.position = nowPosition;
	
	return;
}

- (void) ccTouchesEnded: (NSSet *)touches withEvent: (UIEvent *)event
{
	isDragging = NO;
	return;
}

- (void)dealloc
{
	self.audio = nil;
	[scrollLayer release];
	[menuItems release];
	[super dealloc];
}

@end
