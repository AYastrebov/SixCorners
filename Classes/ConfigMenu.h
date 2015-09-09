//
//  ConfigMenu.h
//  6Corners
//
//  Created by Andrey Yastrebov on 2/22/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "cocos2d.h"

@class MenuScene;

@interface ConfigMenu : CCLayer 
{
	CCSprite *slider;
	float sliderValue;
	CCLabelTTF *volLabel;
	MenuScene *mainMenu;
	
	NSString *menuPath;
	NSString *menuButtonsPath;
	NSString *gameFieldPath;
}

+ (id) scene;
- (void) tick: (ccTime) dt;
- (void)setMenuScene:(MenuScene *)menuScene;

@end
