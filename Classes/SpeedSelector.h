//
//  SpeedSelector.h
//  6Corners
//
//  Created by Andrey Yastrebov on 3/8/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "cocos2d.h"

@class Slider;
@class Audio;
@class LevelsMenu;

@interface SpeedSelector : CCLayer 
{
	Slider *slider;
	Audio *bgAudio;
	LevelsMenu *lvlMenu;
	CCLabelBMFont *speedLabel;
	NSUInteger selectedSpeed;
	
	NSString *menuPath;
	NSString *menuButtonsPath;
	NSString *gameFieldPath;
}

- (id) initWithLevelsMenu:(LevelsMenu *)levelsMenu;

@property(nonatomic, retain) Audio *bgAudio;

@end
