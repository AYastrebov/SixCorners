//
//  WinLoseScene.h
//  6Corners
//
//  Created by Andrey Yastrebov on 2/25/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "cocos2d.h"

@interface WinLoseScene : CCLayer 
{
	BOOL gameOver;
	NSUInteger level;
	
	NSString *menuButtonsPath;
	NSString *gameFieldPath;
}

+ (id) scene;
- (id)initWithResult:(BOOL)lose 
			   score:(NSUInteger)currentScore 
			   lines:(NSUInteger)currwntLines 
			   level:(NSUInteger)currentLevel;

- (void)postToTwitterAndFacebook:(id)sender;
- (void)retryNext:(id)sender;

@end
