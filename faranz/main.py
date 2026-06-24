class ThreeInOne:
    def __init__(self, total_size):
       self.stacks = [None] * total_size 
       self.stack_size = total_size // 3
       self.top1 = -1
       self.top2 = self.stack_size - 1
       self.top3 = (self.stack_size * 2) -1


    def push(self,val,stack):
        if stack == 1:
            
            if self.top1 == self.stack_size - 1:
                raise IndexError("Stack 1 is Overflow")
            
            self.top1+=1
            self.stack_size[self.top1] = val
            pass
        if stack == 2:
            if self.top2 == self.stack_size * 2:
                raise IndexError("Stack 2 is Overflow")
            self.top2+=1
            self.stack_size[self.top2] = val

        if stack == 3:
            if self.top3 == len(self.stacks):
                raise IndexError("Stack 3 is Overflow")
            self.top3+=1
            self.stack_size[self.top3] = val

    def pop(self,stack):
        if stack == 1:
            if self.top1 == -1:
                raise ValueError("Stack 1 Underflow")
            value = self.stacks[self.top1]
            self.stacks[self.top1] == None
            self.top1-=1
            return value
   
        if stack == 2:
            if self.top2 == self.stack_size * 2:
                 raise ValueError("Stack 2 Underflow")
            value = self.stacks[self.top2]
            self.stacks[self.top2] == None
            self.top1-=1
            return value

        if stack == 3:
            if self.top3 == len(self.stacks):
                raise IndexError("Stack 3 is Overflow")
            self.top3+=1
            self.stack_size[self.top3] = val