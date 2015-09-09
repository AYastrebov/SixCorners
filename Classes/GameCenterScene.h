//
//  GameCenterScene.h
//  6Corners
//
//  Created by Andrey Yastrebov on 3/2/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "cocos2d.h"

@class MenuScene;

@interface GameCenterScene : CCLayer 
{
	MenuScene *menuScene;
	
	NSString *menuPath;
	NSString *menuButtonsPath;
}

+ (id) scene;
- (id)initWithMenu:(MenuScene *)menu;

@end
