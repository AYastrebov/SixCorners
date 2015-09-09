//
//  SkinChoser.h
//  6Corners
//
//  Created by Andrey Yastrebov on 3/6/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "cocos2d.h"
#import "Audio.h"

@interface SkinChoser : CCLayer 
{
	CCSprite *skinPreview;
	
	CCMenuItem *nextItem;
	CCMenuItem *previousItem;
	CCMenuItem *buyItem;
	CCMenuItem *selectItem;
	
	NSString *menuPath;
	NSString *menuButtonsPath;
	NSString *gameFieldPath;
	
	NSUInteger currentSkin;
    
    Audio *audio;
}

@property(nonatomic, retain) Audio *audio;

+ (id) scene;
- (void)next:(id)sender;
- (void)previous:(id)sender;
- (void)selectSkin:(id)sender;
- (void)back:(id)sender;
- (void)lockButton;
- (void)buySkin:(id)sender;
- (void)initSkinPreview;

@end
