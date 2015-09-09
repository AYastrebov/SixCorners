//
//  MenuScene.m
//  6Corners
//
//  Created by Andrey Yastrebov on 2/22/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import "MenuScene.h"
#import "GameField.h"
#import "ConfigMenu.h"
#import "Audio.h"
#import "LevelsMenu.h"
#import "_CornersAppDelegate.h"
#import "GameCenterScene.h"
#import "SkinsManager.h"
#import "SkinChoser.h"
#import "SupportScene.h"

@implementation MenuScene
@synthesize audioMenu;

+ (id) scene
{
	// 'scene' is an autorelease object.
	CCScene *scene = [CCScene node];
	
	// 'layer' is an autorelease object.
	MenuScene *layer = [MenuScene node];
	
	// add layer as a child to scene
	[scene addChild: layer];
	
	// return the scene
	return scene;
}

- (id) init
{
    self = [super init];
    if (self != nil) 
	{
		[self reset:nil];
		
		CGSize winSize = [[CCDirector sharedDirector] winSize];
		
		menuButtonsPath = [SkinsManager menuButtonsPath];
		gameFieldPath = [SkinsManager gameFieldPath];
		
		//background
		CCSprite *background = [CCSprite spriteWithFile:[NSString stringWithFormat:@"%@/%@",gameFieldPath ,@"background.png"]];
		[background setPosition:ccp(winSize.width/2, winSize.height/2)];
		[self addChild:background z:-1];
		
		[CCMenuItemFont setFontSize:50];
		
        CCMenuItem *menuItem1 = [CCMenuItemImage 
								 itemFromNormalImage:[NSString stringWithFormat:@"%@/%@",menuButtonsPath ,@"newgame.png"] 
								 selectedImage:[NSString stringWithFormat:@"%@/%@",menuButtonsPath ,@"newgame2.png"] 
								 target:self 
								 selector:@selector(onPlay:)];
		
        CCMenuItem *menuItem2 = [CCMenuItemImage 
								 itemFromNormalImage:[NSString stringWithFormat:@"%@/%@",menuButtonsPath ,@"levels.png"] 
								 selectedImage:[NSString stringWithFormat:@"%@/%@",menuButtonsPath ,@"levels2.png"] 
								 target:self 
								 selector:@selector(onLevelSelect:)];
		
        CCMenuItem *menuItem3 = [CCMenuItemImage 
								 itemFromNormalImage:[NSString stringWithFormat:@"%@/%@",menuButtonsPath ,@"of.png"] 
								 selectedImage:[NSString stringWithFormat:@"%@/%@",menuButtonsPath ,@"of2.png"] 
								 target:self selector:@selector(openFeint:)];
		
		CCMenuItem *menuItem4 = [CCMenuItemImage 
								 itemFromNormalImage:[NSString stringWithFormat:@"%@/%@",menuButtonsPath ,@"gc.png"] 
								 selectedImage:[NSString stringWithFormat:@"%@/%@",menuButtonsPath ,@"gc2.png"] 
								 target:self selector:@selector(gameCenter:)];
		
		CCMenuItem *menuItem5 = [CCMenuItemImage 
								 itemFromNormalImage:[NSString stringWithFormat:@"%@/%@",menuButtonsPath ,@"options.png"] 
								 selectedImage:[NSString stringWithFormat:@"%@/%@",menuButtonsPath ,@"options2.png"] 
								 target:self selector:@selector(onSettings:)];
		
		CCMenuItem *menuItem6 = [CCMenuItemImage 
								 itemFromNormalImage:[NSString stringWithFormat:@"%@/%@",menuButtonsPath ,@"support.png"] 
								 selectedImage:[NSString stringWithFormat:@"%@/%@",menuButtonsPath ,@"support2.png"] 
								 target:self selector:@selector(onAbout:)];
		
		CCMenuItem *menuItem7 = [CCMenuItemImage itemFromNormalImage:[NSString stringWithFormat:@"%@/%@",menuButtonsPath ,@"skins.png"] 
												   selectedImage:[NSString stringWithFormat:@"%@/%@",menuButtonsPath ,@"skins2.png"] 
														  target:self 
														selector:@selector(skinSelector:)];
		
		menuItems = [[NSArray alloc] initWithObjects:menuItem1, menuItem2, menuItem3, menuItem4, menuItem5, menuItem6, menuItem7, nil];
				
        CCMenu *menu1 = [CCMenu menuWithItems:menuItem1, menuItem2, menuItem7, nil];
        [menu1 alignItemsVerticallyWithPadding:15];
		menu1.position = ccp(winSize.width/2, winSize.height - 120);
		
		CCMenu *menuSocial = [CCMenu menuWithItems:menuItem3, menuItem4, nil];
		[menuSocial alignItemsHorizontallyWithPadding:20];
		menuSocial.position = ccp(winSize.width/2, winSize.height/2 - 40);
		
		CCMenu *menu2 = [CCMenu menuWithItems:menuItem5, menuItem6, nil];
        [menu2 alignItemsVerticallyWithPadding:15];
		menu2.position = ccp(winSize.width/2, 80);

		[self addChild:menu1];
		[self addChild:menuSocial];
        [self addChild:menu2];
		
		gcScene = [[GameCenterScene alloc] initWithMenu:self];
		gcScene.position = ccp(160, 240);
		gcScene.tag = 1;
		
		[self.audioMenu playMenuMusic:nil];
    }
    return self;
}

- (void)onPlay:(id)sender
{
	[self.audioMenu stopMusic];
	GameField *gameField = [GameField node];
	[gameField setLevel:0 speed:0];
	[[CCDirector sharedDirector] replaceScene:[CCTransitionShrinkGrow transitionWithDuration:.5f scene:(CCScene *)gameField]];
}

- (void)onSettings:(id)sender
{
	ConfigMenu *configMenu = [ConfigMenu node];
	[configMenu setMenuScene:self];
    [[CCDirector sharedDirector] pushScene:[CCTransitionShrinkGrow transitionWithDuration:.5f scene:(CCScene *)configMenu]];
}

- (void)skinSelector:(id)sender
{
    SkinChoser *skinChooser = [SkinChoser node];
    skinChooser.audio = audioMenu;
	[[CCDirector sharedDirector] pushScene:[CCTransitionShrinkGrow transitionWithDuration:.5f scene:(CCScene *)skinChooser]];
}

- (void)openFeint:(id)sender
{
}

- (void)gameCenter:(id)sender
{
	[self addChild:gcScene z:1];
	[self disableMenuItems];
}

- (void)onLevelSelect:(id)sender
{
	LevelsMenu *levelMenu = [LevelsMenu node];
	levelMenu.audio = self.audioMenu;
	[[CCDirector sharedDirector] pushScene:[CCTransitionShrinkGrow transitionWithDuration:.5f scene:(CCScene *)levelMenu]];
}

- (void)onAbout:(id)sender
{
    [[CCDirector sharedDirector] pushScene:[CCTransitionShrinkGrow transitionWithDuration:.5f scene:[SupportScene node]]];
}

- (void)disableMenuItems
{
	for (CCMenuItem *menuItem in menuItems) 
	{
		[menuItem setIsEnabled:NO];
	}
}

- (void)enableMenuItems
{
	for (CCMenuItem *menuItem in menuItems) 
	{
		[menuItem setIsEnabled:YES];
	}
}

- (void)reset:(id)sender 
{
	if (self.audioMenu) 
	{
		self.audioMenu = nil;
	}
	self.audioMenu = [[Audio alloc] init];
}

- (void) dealloc
{
	self.audioMenu = nil;
	[menuItems release];
	[super dealloc];
}

@end
