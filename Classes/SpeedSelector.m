//
//  SpeedSelector.m
//  6Corners
//
//  Created by Andrey Yastrebov on 3/8/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import "SpeedSelector.h"
#import "SkinsManager.h"
#import "Slider.h"
#import "GameField.h"
#import "Audio.h"
#import "_CornersAppDelegate.h"
#import "LevelsMenu.h"

@implementation SpeedSelector
@synthesize bgAudio;

- (id) initWithLevelsMenu:(LevelsMenu *)levelsMenu
{
	if( (self = [super init] ) ) 
	{		
		menuPath = [SkinsManager menuPath];
		menuButtonsPath = [SkinsManager menuButtonsPath];
		gameFieldPath = [SkinsManager gameFieldPath];
		
		lvlMenu = [levelsMenu retain];
		
		//background
		CCSprite *background = [CCSprite spriteWithFile:[NSString stringWithFormat:@"%@/%@",menuPath ,@"speed.png"]];
		[self addChild:background z:-1];
		
		NSUInteger speed = [_CornersAppDelegate preferdSpeed];

		speedLabel = [CCLabelBMFont labelWithString:[NSString stringWithFormat:@"%d", speed + 1] fntFile:@"arcade.fnt"];
		[speedLabel setPosition:CGPointMake(0, 50)];
		
		slider = [[Slider alloc] initWithTarget:self 
									   selector:@selector(sliderCallback:)];
		
		slider.value = (float)speed/10;
		[slider setLiveDragging:YES];
		
		CCMenuItem *menuItem1 = [CCMenuItemImage itemFromNormalImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"play.png"] 
													   selectedImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"play2.png"] 
															  target:self 
															selector:@selector(playButtonPressed:)];
		
		CCMenuItem *menuItem2 = [CCMenuItemImage itemFromNormalImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"close_small.png"] 
													   selectedImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"close_small2.png"] 
															  target:self 
															selector:@selector(close:)];
		
		CCMenu *menu = [CCMenu menuWithItems:menuItem1, menuItem2, nil];
		[menu alignItemsVerticallyWithPadding:10];
		menu.position = CGPointMake(0, -80);
		
		[self addChild:slider];
		[self addChild:speedLabel];
		[self addChild:menu];
	}
	return self;
}

- (void)sliderCallback:(SliderThumb*)sender
{
	float val = [sender value];
	NSUInteger zeroToTen = val * 10;
	[speedLabel setString:[NSString stringWithFormat:@"%d", zeroToTen + 1]];
	selectedSpeed = zeroToTen;
}

- (void)playButtonPressed:(id)sender
{
	[self.bgAudio stopMusic];
	[_CornersAppDelegate setPreferdSpeed:selectedSpeed];
	GameField *gameField = [GameField node];
	[gameField setLevel:10 speed:selectedSpeed];
	[[CCDirector sharedDirector] replaceScene:[CCTransitionShrinkGrow transitionWithDuration:.5f scene:(CCScene *)gameField]];
}

- (void)close:(id)sender
{
	[lvlMenu lockButtons:NO];
	[lvlMenu removeChildByTag:12 cleanup:YES];
}

- (void)dealloc
{
	self.bgAudio = nil;
	[slider release];
	[lvlMenu release];
	[super dealloc];
}

@end
