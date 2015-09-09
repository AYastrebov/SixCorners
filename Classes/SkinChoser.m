//
//  SkinChoser.m
//  6Corners
//
//  Created by Andrey Yastrebov on 3/6/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import "SkinChoser.h"
#import "SkinsManager.h"
#import "_CornersAppDelegate.h"
#import "MenuScene.h"

@implementation SkinChoser
@synthesize audio;

+ (id) scene
{
	// 'scene' is an autorelease object.
	CCScene *scene = [CCScene node];
	
	// 'layer' is an autorelease object.
	SkinChoser *layer = [SkinChoser node];
	
	// add layer as a child to scene
	[scene addChild: layer];
	
	// return the scene
	return scene;
}

- (id) init
{
	if( (self = [super init] ) ) 
	{
		CGSize winSize = [[CCDirector sharedDirector] winSize];
		
		currentSkin = [_CornersAppDelegate selectedSkin];
		
		menuButtonsPath = [SkinsManager menuButtonsPath];
		gameFieldPath = [SkinsManager gameFieldPath];
		menuPath = [SkinsManager menuPath];
		
		CCSprite *background = [CCSprite spriteWithFile:[NSString stringWithFormat:@"%@/%@",gameFieldPath ,@"background.png"]];
		[background setPosition:ccp(winSize.width/2, winSize.height/2)];
		[self addChild:background z:-1];
		
		CCSprite *skinFrame = [CCSprite spriteWithFile:@"Skin_frame.png"];
		[skinFrame setPosition:ccp(winSize.width/2, winSize.height/2)];
		[self addChild:skinFrame z:1];
		
        [self initSkinPreview];
		
		nextItem = [[CCMenuItemImage itemFromNormalImage:[NSString stringWithFormat:@"%@/%@", menuPath, @"arrow_r.png"] 
										   selectedImage:[NSString stringWithFormat:@"%@/%@", menuPath, @"arrow_r2.png"] 
										   disabledImage:[NSString stringWithFormat:@"%@/%@", menuPath, @"arrow_r3.png"] 
												  target:self 
												selector:@selector(next:)] retain];
		nextItem.tag = 11;
		
		previousItem = [[CCMenuItemImage itemFromNormalImage:[NSString stringWithFormat:@"%@/%@", menuPath, @"arrow_l.png"] 
											   selectedImage:[NSString stringWithFormat:@"%@/%@", menuPath, @"arrow_l2.png"] 
											   disabledImage:[NSString stringWithFormat:@"%@/%@", menuPath, @"arrow_l3.png"]
													  target:self 
													selector:@selector(previous:)] retain];
		previousItem.tag = 12;
		
		selectItem = [[CCMenuItemImage itemFromNormalImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"select.png"] 
											selectedImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"select2.png"] 
												   target:self 
												 selector:@selector(selectSkin:)] retain];
		selectItem.tag = 13;
		
		buyItem = [[CCMenuItemImage itemFromNormalImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"buy.png"] 
										 selectedImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"buy2.png"] 
												target:self 
											  selector:@selector(buySkin:)] retain];
		buyItem.tag = 14;
		
		CCMenuItem *back = [CCMenuItemImage itemFromNormalImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"goback_small.png"] 
												  selectedImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"goback_small2.png"] 
														 target:self 
													   selector:@selector(back:)];
		
		CCMenu *arrowsMenu = [CCMenu menuWithItems:previousItem, selectItem, nextItem, nil];
		[arrowsMenu alignItemsHorizontallyWithPadding:16];
		arrowsMenu.position = ccp(winSize.width/2, 40);
		[self addChild:arrowsMenu z:0];
		
		CCMenu *backMenu = [CCMenu menuWithItems:back, nil];
		backMenu.position = ccp(winSize.width/2, 440);
		[self addChild:backMenu z:0];
				
		[self lockButton];
	}
	return self;
}

- (void)initSkinPreview
{
    if (skinPreview != nil) 
    {
        [skinPreview release];
    }
    CGSize winSize = [[CCDirector sharedDirector] winSize];
    skinPreview = [[CCSprite spriteWithFile:[NSString stringWithFormat:@"SkinPreview_%d.png", currentSkin]] retain];
    skinPreview.tag = 0 + currentSkin;
    skinPreview.position = ccp(winSize.width/2, winSize.height/2);
    [self addChild:skinPreview z:2];
}

- (void)lockButton
{
	if (currentSkin == 0) 
	{
		[previousItem setIsEnabled:NO];
	}
	else 
	{
		[previousItem setIsEnabled:YES];
	}

	if (currentSkin == 2) 
	{
		[nextItem setIsEnabled:NO];
	}
	else 
	{
		[nextItem setIsEnabled:YES];
	}

}

- (void)next:(id)sender
{
    if (currentSkin <= 2) 
    {
        currentSkin++;
        [self removeChild:skinPreview cleanup:YES];
        [self initSkinPreview];
    }
    [self lockButton];
}

- (void)previous:(id)sender
{
    if (currentSkin >= 0) 
    {
        currentSkin--;
        [self removeChild:skinPreview cleanup:YES];
        [self initSkinPreview];
    }
    [self lockButton];
}

- (void)selectSkin:(id)sender
{
    [self.audio stopMusic];
    [_CornersAppDelegate setSkin:currentSkin];
    [[CCDirector sharedDirector] replaceScene:[CCTransitionShrinkGrow transitionWithDuration:.5f scene:[MenuScene node]]];
}

- (void)buySkin:(id)sender
{
}

- (void)back:(id)sender
{
	[[CCDirector sharedDirector] popSceneWithTransition:[CCTransitionShrinkGrow class] duration:.5f];
}

- (void)dealloc
{
    self.audio = nil;
	[skinPreview release];
	[nextItem release];
	[previousItem release];
	[selectItem release];
	[buyItem release];
	[super dealloc];
}

@end
