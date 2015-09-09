//
//  MenuScene.h
//  6Corners
//
//  Created by Andrey Yastrebov on 2/22/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "cocos2d.h"

@class Audio;
@class GameCenterScene;

@interface MenuScene : CCLayer 
{
	Audio* audioMenu;
	GameCenterScene *gcScene;
	NSArray *menuItems;
	
	NSString *menuButtonsPath;
	NSString *gameFieldPath;
}

@property(nonatomic, retain) Audio* audioMenu;

+ (id) scene;
- (void)reset:(id)sender;
- (void)disableMenuItems;
- (void)enableMenuItems;

@end
