//
//  ConfigMenu.m
//  6Corners
//
//  Created by Andrey Yastrebov on 2/22/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import "ConfigMenu.h"
#import "MenuScene.h"
#import "Audio.h"
#import "SimpleAudioEngine.h"
#import "_CornersAppDelegate.h"
#import "SkinsManager.h"
#import "SkinChoser.h"

#define SLIDER_POS_MAX 261.0f
#define SLIDER_POS_MIN 59.0f
#define SLIDER_POS_Y 50.0f
#define SLIDER_POS_X 160.0f

#define PAD_SLIDER_DIVISION 400

@implementation ConfigMenu

+ (id) scene
{
	// 'scene' is an autorelease object.
	CCScene *scene = [CCScene node];
	
	// 'layer' is an autorelease object.
	ConfigMenu *layer = [ConfigMenu node];
	
	// add layer as a child to scene
	[scene addChild: layer];
	
	// return the scene
	return scene;
}

-(id) init
{
	if( (self = [super init] ) ) 
	{
		self.isTouchEnabled = YES;
		
		CGSize winSize = [[CCDirector sharedDirector] winSize];
		
		menuPath = [SkinsManager menuPath];
		menuButtonsPath = [SkinsManager menuButtonsPath];
		gameFieldPath = [SkinsManager gameFieldPath];
		
		//background
		CCSprite *background = [CCSprite spriteWithFile:[NSString stringWithFormat:@"%@/%@",gameFieldPath ,@"background.png"]];
		[background setPosition:ccp(winSize.width/2, winSize.height/2)];
		[self addChild:background z:-1];
		
		CCMenuItemToggle *item1 = [CCMenuItemToggle itemWithTarget:self selector:@selector(soundSwitcher:) items:
								   [CCMenuItemImage 
									itemFromNormalImage:[NSString stringWithFormat:@"%@/%@",menuButtonsPath ,@"soundon.png"] 
									selectedImage:[NSString stringWithFormat:@"%@/%@",menuButtonsPath ,@"soundon.png"]],
								   [CCMenuItemImage 
									itemFromNormalImage:[NSString stringWithFormat:@"%@/%@",menuButtonsPath ,@"soundoff.png"] 
									selectedImage:[NSString stringWithFormat:@"%@/%@",menuButtonsPath ,@"soundoff.png"]],
								   nil];
		if ([_CornersAppDelegate isMute]) 
		{
			[item1 setSelectedIndex:1];
		}
		else 
		{
			[item1 setSelectedIndex:0];
		}

		CCMenuItem *item2 = [CCMenuItemImage itemFromNormalImage:[NSString stringWithFormat:@"%@/%@",menuButtonsPath ,@"skins.png"] 
													   selectedImage:[NSString stringWithFormat:@"%@/%@",menuButtonsPath ,@"skins2.png"] 
															  target:self 
															selector:@selector(skinSelector:)];

		CCMenuItem *back = [CCMenuItemImage itemFromNormalImage:[NSString stringWithFormat:@"%@/%@",menuButtonsPath ,@"goback.png"] 
												   selectedImage:[NSString stringWithFormat:@"%@/%@",menuButtonsPath ,@"goback2.png"] 
														  target:self 
														selector:@selector(backCallback:)];
				
		CCMenu *menu = [CCMenu menuWithItems:
						back, item2, item1,
						nil];
		[menu alignItemsVerticallyWithPadding:50];
		menu.position = ccp(winSize.width/2, winSize.height/2 + 30);
		
		NSUInteger vol = [_CornersAppDelegate musicVolume] * 100;
		volLabel = [CCLabelTTF labelWithString:[NSString stringWithFormat:@"volume: %d%%", vol] 
												  fontName:@"Marker Felt" 
												  fontSize:30];
		[volLabel setColor:ccc3(0,0,0)];
		
		slider = [CCSprite spriteWithFile:[NSString stringWithFormat:@"%@/%@",menuPath ,@"slider.png"]];
		float volume = [_CornersAppDelegate musicVolume];
		float sliderPosx = volume * (SLIDER_POS_MAX - SLIDER_POS_MIN) + SLIDER_POS_MIN;
		[slider setPosition:CGPointMake(sliderPosx, SLIDER_POS_Y)];
		[volLabel setPosition:CGPointMake(SLIDER_POS_X, SLIDER_POS_Y + 50)];
		
		CCSprite *sliderBackground = [CCSprite spriteWithFile:[NSString stringWithFormat:@"%@/%@",menuPath ,@"sliderbg.png"]];
		[sliderBackground setPosition:CGPointMake(SLIDER_POS_X, SLIDER_POS_Y)];
		
		[self addChild: menu];
		[self addChild:sliderBackground z:1];
		[self addChild:slider z:2];
		[self addChild:volLabel];
	}
	[self schedule:@selector(tick:)];
	return self;
}

- (void)setMenuScene:(MenuScene *)menuScene
{
	mainMenu = [menuScene retain];
}

- (void)soundSwitcher:(id)sender
{
	if ([_CornersAppDelegate isMute]) 
	{
		[_CornersAppDelegate setIsMute:NO];
		[[SimpleAudioEngine sharedEngine] setMute:NO];
		
		float volume = [_CornersAppDelegate musicVolume];
		float sliderPosx = volume * (SLIDER_POS_MAX - SLIDER_POS_MIN) + SLIDER_POS_MIN;
		[slider setPosition:CGPointMake(sliderPosx, SLIDER_POS_Y)];
		if (![[SimpleAudioEngine sharedEngine] isBackgroundMusicPlaying]) 
		{
			[mainMenu.audioMenu playMenuMusic:nil];
		}
	}
	else 
	{
		[_CornersAppDelegate setIsMute:YES];
		[[SimpleAudioEngine sharedEngine] setMute:YES];
	}
	[mainMenu reset:nil];
}

- (void)skinSelector:(id)sender
{
    SkinChoser *skinChooser = [SkinChoser node];
    skinChooser.audio = mainMenu.audioMenu;
	[[CCDirector sharedDirector] pushScene:[CCTransitionShrinkGrow transitionWithDuration:.5f scene:(CCScene *)skinChooser]];
}

- (void)backCallback:(id)sender
{
	[[CCDirector sharedDirector] popSceneWithTransition:[CCTransitionShrinkGrow class] duration:.5f];
}

- (void)tick:(ccTime)dt
{
	NSUInteger vol = 0;
	if (![_CornersAppDelegate isMute]) 
	{
		sliderValue = (((slider.position.x) - SLIDER_POS_MIN) / (SLIDER_POS_MAX - SLIDER_POS_MIN));// 0 to 1
		vol = sliderValue * 100;
		[_CornersAppDelegate setMusicVolume:sliderValue];
		[[SimpleAudioEngine sharedEngine] setBackgroundMusicVolume:sliderValue];
	}
	else 
	{
		[slider setPosition:CGPointMake(SLIDER_POS_MIN, SLIDER_POS_Y)];
	}

	[volLabel setString:[NSString stringWithFormat:@"volume: %d%%", vol]];
}

- (void)ccTouchesMoved:(NSSet *)touches withEvent:(UIEvent *)event
{	
	//We are only interested in the slider for moving touches
	UITouch *touch = [touches anyObject];
	CGPoint location = [touch locationInView: [touch view]];
	if (location.y > PAD_SLIDER_DIVISION) 
	{
		//We are in the slider region
		if (location.x > SLIDER_POS_MAX) 
		{
			[slider setPosition:CGPointMake(SLIDER_POS_MAX, SLIDER_POS_Y)];	
		} 
		else
		{
			if (location.x < SLIDER_POS_MIN) 
			{	
				[slider setPosition:CGPointMake(SLIDER_POS_MIN, SLIDER_POS_Y)]; 
			} 
			else 
			{
				[slider setPosition:CGPointMake(location.x, SLIDER_POS_Y)];
			}
		}
	}
}

- (void) dealloc
{
	[mainMenu release];
	[super dealloc];
}

@end
