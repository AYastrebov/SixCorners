//
//  SupportScene.m
//  6Corners
//
//  Created by Andrey Yastrebov on 3/6/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import "SupportScene.h"
#import "SkinsManager.h"

@implementation SupportScene

+ (id) scene
{
	// 'scene' is an autorelease object.
	CCScene *scene = [CCScene node];
	
	// 'layer' is an autorelease object.
	SupportScene *layer = [SupportScene node];
	
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
        CGSize winSize = [[CCDirector sharedDirector] winSize];
        
        menuButtonsPath = [SkinsManager menuButtonsPath];
		gameFieldPath = [SkinsManager gameFieldPath];
		menuPath = [SkinsManager menuPath];
        
        CCSprite *background = [CCSprite spriteWithFile:[NSString stringWithFormat:@"%@/%@",gameFieldPath ,@"background.png"]];
		[background setPosition:ccp(winSize.width/2, winSize.height/2)];
		[self addChild:background z:-1];
        
        CCSprite *about = [CCSprite spriteWithFile:@"About.png"];
        about.position = ccp(winSize.width/2, winSize.height/2);
        [self addChild:about z:2];
        
        CCMenuItem *nextItem = [CCMenuItemImage itemFromNormalImage:[NSString stringWithFormat:@"%@/%@", menuPath, @"arrow_r.png"] 
										   selectedImage:[NSString stringWithFormat:@"%@/%@", menuPath, @"arrow_r2.png"] 
										   disabledImage:[NSString stringWithFormat:@"%@/%@", menuPath, @"arrow_r3.png"] 
												  target:self 
												selector:@selector(next:)];
        [nextItem setIsEnabled:NO];
		nextItem.tag = 1;
		
		CCMenuItem *previousItem = [CCMenuItemImage itemFromNormalImage:[NSString stringWithFormat:@"%@/%@", menuPath, @"arrow_l.png"] 
											   selectedImage:[NSString stringWithFormat:@"%@/%@", menuPath, @"arrow_l2.png"] 
											   disabledImage:[NSString stringWithFormat:@"%@/%@", menuPath, @"arrow_l3.png"]
													  target:self 
													selector:@selector(previous:)];
        [previousItem setIsEnabled:NO];
		previousItem.tag = 2;
		
		CCMenuItem *goBackItem = [CCMenuItemImage itemFromNormalImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"menu.png"] 
                                             selectedImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"menu2.png"] 
                                                    target:self 
                                                  selector:@selector(goBack:)];
		goBackItem.tag = 3;

		
		CCMenu *arrowsMenu = [CCMenu menuWithItems:previousItem, goBackItem, nextItem, nil];
		[arrowsMenu alignItemsHorizontallyWithPadding:10];
		arrowsMenu.position = ccp(winSize.width/2, 40);
		[self addChild:arrowsMenu z:0];

    }
    return self;
}

- (void)next:(id)sender
{

}

- (void)previous:(id)sender
{
    
}

- (void)goBack:(id)sender
{
    [[CCDirector sharedDirector] popSceneWithTransition:[CCTransitionShrinkGrow class] duration:.5f];
}

- (void)dealloc
{
	[super dealloc];
}

@end
