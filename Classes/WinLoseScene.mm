//
//  WinLoseScene.m
//  6Corners
//
//  Created by Andrey Yastrebov on 2/25/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import "WinLoseScene.h"
#import "GameField.h"
#import "SkinsManager.h"

@implementation WinLoseScene

+ (id) scene
{
	// 'scene' is an autorelease object.
	CCScene *scene = [CCScene node];
	
	// 'layer' is an autorelease object.
	WinLoseScene *layer = [WinLoseScene node];
	
	// add layer as a child to scene
	[scene addChild: layer];
	
	// return the scene
	return scene;
}

- (id)initWithResult:(BOOL)lose 
			   score:(NSUInteger)currentScore 
			   lines:(NSUInteger)currwntLines 
			   level:(NSUInteger)currentLevel
{
	if ((self = [super init])) 
	{
		gameOver = lose;
		level = currentLevel;
		CCSprite *bg;
		CCMenuItem *menuItem1;
		
		menuButtonsPath = [SkinsManager menuButtonsPath];
		gameFieldPath = [SkinsManager gameFieldPath];
		
		if (!lose) 
		{
			bg = [CCSprite spriteWithFile:[NSString stringWithFormat:@"%@/%@", gameFieldPath, @"win.png"]];
			//next
			menuItem1 = [CCMenuItemImage itemFromNormalImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"next.png"] 
											   selectedImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"next2.png"] 
													  target:self 
													selector:@selector(retryNext:)];
		}
		else 
		{
			bg = [CCSprite spriteWithFile:[NSString stringWithFormat:@"%@/%@",gameFieldPath ,@"lose.png"]];
			//retry
			menuItem1 = [CCMenuItemImage itemFromNormalImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"retry.png"] 
											   selectedImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"retry2.png"] 
													  target:self 
													selector:@selector(retryNext:)];
		}
		
		CCMenuItem *menuItem2 = [CCMenuItemImage itemFromNormalImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"social_button.png"] 
													   selectedImage:[NSString stringWithFormat:@"%@/%@", menuButtonsPath, @"social_button2.png"] 
															  target:self 
															selector:@selector(postToTwitterAndFacebook:)];
		CCMenu *menu = [CCMenu menuWithItems:menuItem1, menuItem2, nil];
		[menu alignItemsVertically];
        menu.position = ccp(0, -100);
	
		CCLabelBMFont *levelLabel = [CCLabelBMFont labelWithString:[NSString stringWithFormat:@"%d", currentLevel] fntFile:@"arcade.fnt"];
		levelLabel.position = ccp(70, 90);
		
		CCLabelBMFont *linesLabel = [CCLabelBMFont labelWithString:[NSString stringWithFormat:@"%d", currwntLines] fntFile:@"arcade.fnt"];
		linesLabel.position = ccp(70, 40);		
		
		CCLabelBMFont *scoreLabel = [CCLabelBMFont labelWithString:[NSString stringWithFormat:@"%d", currentScore] fntFile:@"arcade.fnt"];
		scoreLabel.position = ccp(70, -10);
		
		[self addChild:bg z:0];
		[self addChild:menu z:1];
		[self addChild:scoreLabel z:2];
		[self addChild:levelLabel z:2];
		[self addChild:linesLabel z:2];
	}
	return self;
}

- (void)postToTwitterAndFacebook:(id)sender
{
}

- (void)retryNext:(id)sender
{
	GameField *gameField = [GameField node];
	if (!gameOver) 
	{
		if (level >= 10) 
		{
			[gameField setLevel:level-1 speed:0];
		}
		else 
		{
			[gameField setLevel:level speed:0];
		}
	}
	else 
	{
		[gameField setLevel:level-1 speed:0];
	}
	[[CCDirector sharedDirector] replaceScene:[CCTransitionShrinkGrow transitionWithDuration:.5f scene:(CCScene *)gameField]];
}

- (void)dealloc
{
	[super dealloc];
}

@end
