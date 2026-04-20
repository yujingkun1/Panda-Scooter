package com.panda.mapper;

import com.panda.entity.DispatchRecord;
import com.panda.vo.DispatchHistoryVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface DispatchRecordMapper {

    int insert(DispatchRecord dispatchRecord);

    DispatchRecord getActiveRecord(@Param("dispatcherId") Long dispatcherId, @Param("scooterId") Long scooterId);

    DispatchRecord getActiveRecordByScooterId(@Param("scooterId") Long scooterId);

    int finishRecord(@Param("id") Long id);

    Integer countByDispatcherAndDate(@Param("dispatcherId") Long dispatcherId, @Param("date") LocalDate date);

    List<DispatchHistoryVO> listHistoryByDispatcherId(@Param("dispatcherId") Long dispatcherId);
}
