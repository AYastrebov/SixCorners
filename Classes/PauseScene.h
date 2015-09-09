//
//  PauseScene.h
//  6Corners
//
//  Created by Andrey Yastrebov on 3/1/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "cocos2d.h"

@class GameField;

@interface PauseScene : CCLayer 

{
	GameField *currentGame;
	
	NSString *menuButtonsPath;
	NSString *gameFieldPath;
}

+ (id) scene;
- (id)initWithGameScene:(GameField *)gameField;

@end
