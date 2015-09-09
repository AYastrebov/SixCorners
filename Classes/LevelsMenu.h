//
//  LevelsMenu.h
//  6Corners
//
//  Created by Andrey Yastrebov on 2/26/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "cocos2d.h"

@class Audio;

@interface LevelsMenu : CCLayer 
{
	CCLayer *scrollLayer;
	Audio *audio;
	BOOL isDragging;
	float lasty;
	float yvel;
	int contentHeight;
	int kEventHandled;
	CGSize winSize;
	
	NSArray *menuItems;
	
	NSString *menuButtonsPath;
	NSString *gameFieldPath;
}

@property(nonatomic, retain) Audio *audio;

+ (id) scene;
- (void)lockButtons:(BOOL)lock;

@end
