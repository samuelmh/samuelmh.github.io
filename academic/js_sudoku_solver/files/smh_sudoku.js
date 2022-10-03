/*
 * AUTHOR: Samuel Muñoz Hidalgo <samuel.mh@gmail.com>
 * DATE: AUG-2014
 * DESCRIPTION:
 *  A sudoku solver with some html view capabilities.
*/


var smh_sudoku = function (elem_id){
    
    var elem_id = elem_id; //Id attrib of the tag to place the board.
    
    
    /*
     *  VIEW, HTML RELATED THINGS
     */
    
    function view_build(){
        var table = document.getElementById(elem_id)
            .appendChild(document.createElement("table"));
        table.setAttribute("class", elem_id+"-table");
        var i,row, j,col, 
            minitable, mi, mrow, mj;        
        var tmp, id; //temporal elements
        
        //Automagically set tabindex to easy navigation.
        var tabindex_offset = Math.max.apply(
            null, 
            $.makeArray($('*[tabindex]').map(
                function(k,v){
                    return(parseInt(v.getAttribute('tabindex')));
                }
            ))
        );
        tabindex_offset = tabindex_offset<0?1:tabindex_offset+1;        
        
        for (i=0;i<3;i++){ //row
            row = table.appendChild(document.createElement('tr'));    
            for (j=0;j<3;j++){ //column
                minitable = document.createElement("table");
                minitable.setAttribute("class", elem_id+"-minitable");
                for (mi=0;mi<3;mi++){
                    mrow =minitable.appendChild(document.createElement('tr'));
                    for (mj=0;mj<3;mj++){
                        id = 9*(3*i+mi)+3*j+mj;
                        tmp = document.createElement('input');
                        tmp.setAttribute("class", "text "+elem_id+"-input");  
                        tmp.setAttribute("type", "text");                   
                        tmp.setAttribute("maxlength", "1");                
                        tmp.setAttribute("size", "1");                
                        tmp.setAttribute("tabindex", id+tabindex_offset);
                        tmp.setAttribute("id", elem_id+'['+id+']');
                        mrow.appendChild(document.createElement('td'))
                            .appendChild(tmp);
                    }
                }
                row.appendChild(document.createElement('td'))
                    .appendChild(minitable);
            }
        }
    }
    
    
    
    function view_set(data){
        var i;
        for (i=0;i<81;i++){
            document.getElementById(elem_id+'['+i+']').value = data[i];
        }
    }


    function view_get(){
        var re = new RegExp('[0-9]');
        var retval = [];
        var i,val;
        for (i=0;i<81;i++){
            val = document.getElementById(elem_id+'['+i+']').value;
            if (re.test(val)){
                retval.push(parseInt(val));
    //             document.getElementById(elem_id+'['+i+']').setAttribute("readonly", true);
            } else {
                retval.push(0);
            }        
        }
        return(retval);
    }
    
    function view_reset(){
        data = [];
        var i;
        for (i=0;i<81;i++){
            data.push('');            
        }
        view_set(data);
    }
    
    
    /*
     * CSP SOLVER
     */
    
    /* Given the element of a row, calculate the index of the offset element
     * corresponding to the row.
     */
    function offset_row(elem_index,offset){
        return( (Math.floor(elem_index/9)*9) + offset );
    }
    
    /* Given the element of a column, calculate the index of the offset element
     * corresponding to the column.
     */
    function offset_column(elem_index,offset){
        return( (elem_index%9) + (9*offset) )
    }
    
    /* Given the element of a minitable, calculate the index of the offset 
     * element corresponding to the minitable.
     */
    function offset_minitable(elem_index, offset){
        return(
            Math.floor(elem_index/27)*27 + Math.floor((elem_index%9)/3)*3 + 
            Math.floor(offset/3)*9 + (offset%3)
        );
    }
    
    
    /* Return true if the new element does not violate any rule.
     * data: 81x1 array
     * index: index of the current element.
     * func_offset: function used to build the test set.
     */
    function no_violation(data, index, func_offset){
        var val = data[index],
            tmp_pos,
            i = 0,
            retval = true;
        while (retval && (i<9)){
            tmp_pos = func_offset(index,i);
            if (index!=tmp_pos){
                retval = (val != data[tmp_pos]);
            }
            i++;
        }
        return(retval);
    }      
        
  
    // Check if an element (index) violates any constraint in the data.
    function check_rules(data,index,f_rule){
        var retval = false;
        if (
            f_rule(data,index,offset_row) &&
            f_rule(data,index,offset_column) &&
            f_rule(data,index,offset_minitable)
        ){
            retval = true;
        }
        return(retval);
    }

    /* Recursive function that tries to solve a sudoku position.
     * data:  81x1 array that represents the sudoku.
     */
    function sudoku_solve(data){
        var retval = false,
            pos = data.indexOf(0);
        if (pos >-1){
            var val=1,
                flag=true;
            while (flag){
                data[pos] = val;
                if (check_rules(data,pos,no_violation)){
                    retval = sudoku_solve(data);
                }
                if (retval){
                    flag = false;
                } else {
                    val++;
                    if (val>9){
                        data[pos]=0; //Undo changes.
                        flag = false;
                    }
                }
            }
        } else {
            //There are no solvable positions. So this is a solution.
            retval = data;
        }
        return(retval);
    }
    
    /*
     * HIGH LEVEL FUNCTIONS
     */
     
    /* Return true if there are no duplicates in the set.
     * data: 81x1 array
     * index: index of the current element.
     * func_offset: function used to build the test set.
     */
    function no_duplicates(data, index, func_offset){
        var val,
            i = 0,
            tmp = {}, //Store to find duplicates
            retval = true;
        while (retval && (i<9)){
            val = data[func_offset(index,i)];
            if (val!=0){
                if (tmp[val]){
                    retval = false;
                } else {
                    tmp[val] = true;
                }
            }
            i++;
        }
        return(retval);
    }
    
    /*
     * Avoid easy worst cases done by a malicious user.
     * Used for checking the initial problem.
     */
    function check_solvable(data){
        var flag = true,
            retval = true,
            i=0;
        while (flag){
            if (check_rules(data,i,no_duplicates)){
                i++;
                if (i>80){
                    flag = false; 
                }
            } else {
                retval = false;
                flag = false
            }
        }
        return(retval);
    }
    
    
    function solve() {
        var solution = false,
            data = view_get(),
            retval ='';
        //Test if it is a problem.
        if (data.indexOf(0)>-1){
            if (check_solvable(data)){
                solution = sudoku_solve(data);
                if (solution){
                    view_set(solution);
                } else {
                    retval = 'No solution found.';
                }
            } else {
                retval = 'Nothing to solve: inconsistent sudoku.';
            }
        } else {
            retval = 'Nothing to solve: completed sudoku.';
        }
        return(retval);
    }
    
    
    
    view_build();
    return {
        solve: solve,
        reset: view_reset,
        set: view_set  //For the example
    };
    
};